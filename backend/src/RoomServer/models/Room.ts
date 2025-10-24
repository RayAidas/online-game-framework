import { PrefixLogger } from "tsrpc";
import { roomServer } from "../../roomServer";
import { FrameSyncService } from "../../services/FrameSyncService";
import { RedisRoomStateService } from "../../services/RedisRoomStateService";
import { RoomStateService } from "../../services/RoomStateService";
import { MsgUpdateRoomState } from "../../shared/protocols/roomServer/clientMsg/MsgUpdateRoomState";
import { ServiceType } from "../../shared/protocols/serviceProto_roomServer";
import { MsgSyncFrame } from "../../shared/types/FrameSync";
import { GamePhase } from "../../shared/types/GamePhase";
import { RoomData } from "../../shared/types/RoomData";
import { RoomUserState } from "../../shared/types/RoomUserState";
import { RoomServerConn } from "../RoomServer";

export class Room {
	data: RoomData;
	conns: RoomServerConn[] = [];
	userStates: {
		[uid: string]: RoomUserState;
	} = {};
	logger: PrefixLogger;
	overNum: number = 0;
	/**游戏结束标志 - 是否游戏结束*/
	isGameOver: boolean = false;
	/**帧同步服务*/
	private frameSyncService: FrameSyncService | null = null;
	/**血量同步定时器 - 定期广播权威血量防止作弊*/
	private hpSyncTimer: NodeJS.Timeout | null = null;

	constructor(data: RoomData) {
		this.data = data;
		this.overNum = 0;
		this.logger = new PrefixLogger({
			logger: roomServer.logger,
			prefixs: [`[Room ${data.id}]`],
		});
	}

	get state(): MsgUpdateRoomState["rooms"][number] {
		return {
			id: this.data.id,
			name: this.data.name,
			userNum: this.conns.length,
			maxUserNum: this.data.maxUser,
			/** 为 undefined 代表不在匹配中 */
			startMatchTime: this.data.startMatchTime,
			// 房间信息的最后更新时间
			updateTime: this.data.updateTime,
		};
	}

	/** 房间内广播 */
	broadcastMsg<T extends keyof ServiceType["msg"]>(msgName: T, msg: ServiceType["msg"][T]) {
		return roomServer.server.broadcastMsg(msgName, msg, this.conns);
	}

	listenMsgs(conn: RoomServerConn) {
		conn.listenMsg("serverMsg/ExitGame", (call) => {
			let conn = call.conn as RoomServerConn;
			let currentUser = conn.currentUser;
			if (currentUser) {
				currentUser.gamePhase = GamePhase.WAITING;
				RedisRoomStateService.updateUserGamePhase(parseInt(currentUser.id), GamePhase.WAITING);
			}
		});
		conn.listenMsg("clientMsg/UserState", (call) => {
			const conn = call.conn as RoomServerConn;
			// 接收客户端上报的所有玩家状态
			// 每个在线客户端都会上报自己看到的所有玩家状态
			// 服务器合并这些数据，确保即使玩家掉线，其状态也能被其他在线玩家更新
			if (call.msg.states) {
				Object.keys(call.msg.states).forEach((playerId) => {
					const state = call.msg.states[playerId];

					// 坐标转换逻辑：
					// - state.id 表示上报者的视角（当前玩家ID）
					// - playerId 表示被上报的玩家ID
					// - 如果 state.id === playerId，说明是上报自己的位置，坐标是服务器坐标（Y < 0）
					// - 如果 state.id !== playerId，说明是上报其他玩家的位置，坐标是显示坐标（Y > 0），需要转换
					let serverX = state.x;
					let serverY = state.y;

					if (state.id && state.id !== playerId) {
						// 其他玩家的显示坐标需要转换回服务器坐标
						// 显示坐标 → 服务器坐标转换规则：
						// serverX = -displayX
						// serverY = -(displayY - 200)
						// 例如：显示 (100, 400) → 服务器 (-100, -200)
						serverX = -state.x;
						serverY = -(state.y - 200);
						// console.log(`[坐标转换] 玩家 ${playerId} 从视角 ${state.id}: 显示(${state.x}, ${state.y}) → 服务器(${serverX}, ${serverY})`);
					}

					// 使用最新的时间戳来决定是否更新状态
					const existingState = this.userStates[playerId];
					if (!existingState || !existingState.timestamp || state.timestamp >= existingState.timestamp) {
						this.userStates[playerId] = {
							...state,
							x: serverX,
							y: serverY,
						};
					}
				});
			}
		});
	}
	unlistenMsgs(conn: RoomServerConn) {
		conn.unlistenMsgAll("clientMsg/UserState");
	}

	leave(conn: RoomServerConn) {
		const currentUser = conn.currentUser;
		this.logger.log("[UserLeave]", currentUser?.id);

		// 检查是否是房主离开
		const isOwner = currentUser && currentUser.id === this.data.ownerId;

		this.conns.removeOne((v) => v === conn);
		this.data.users.removeOne((v) => v.id === currentUser.id);
		delete this.userStates[currentUser.id];
		this.data.updateTime = Date.now();

		if (conn) {
			// 清除房间引用
			conn.currentRoom = undefined;
		}

		// 清除用户在当前进程内存中的房间状态
		// 注意：此方法只清理房间内部状态，不清理 Redis 和 MatchServer 状态
		// 如果需要完全清理（如用户主动退出），应先调用 RedisRoomStateService.userLeaveRoom()
		if (currentUser && currentUser.id) {
			const userId = parseInt(currentUser.id);
			if (!isNaN(userId)) {
				RoomStateService.userLeaveRoom(userId);
				this.logger.log(`[UserLeave] 清除用户 ${userId} 的房间内存状态`);
			}
		}

		if (currentUser) {
			this.broadcastMsg("serverMsg/UserExit", {
				time: new Date(),
				user: currentUser!,
			});
		}

		// 处理房主离开的情况
		if (isOwner) {
			if (this.conns.length > 0) {
				// 房间还有其他人，转让房主给下一个用户
				const newOwner = this.conns[0].currentUser;
				if (newOwner) {
					this.data.ownerId = newOwner.id;
					this.logger.log(`[UserLeave] 房主转让给用户 ${newOwner.id}`);

					// 广播房主变更消息
					this.broadcastMsg("serverMsg/OwnerChanged", {
						time: new Date(),
						newOwner: newOwner,
						oldOwner: currentUser,
					});
				}
			} else {
				this.unlistenMsgs(conn);
				// 房间没人了，立即销毁房间
				this.logger.log("[UserLeave] 房主离开，房间无人，立即销毁房间");
				this.destroy();
				return; // 房间已销毁，直接返回
			}
		}

		if (this.conns.length === 0) {
			this.data.lastEmptyTime = Date.now();
		}
	}

	destroy() {
		this.logger.log("[Destroy]");
		this._intervals.forEach((v) => {
			clearInterval(v);
		});
		this._intervals = [];

		// 停止帧同步
		if (this.frameSyncService) {
			this.frameSyncService.stopSyncFrame();
			this.frameSyncService = null;
		}

		// 清理房间状态
		RoomStateService.clearRoomState(this.data.id);

		roomServer.rooms.removeOne((v) => v === this);
		roomServer.id2Room.delete(this.data.id);
	}

	/**
	 * 启动帧同步
	 */
	startFrameSync() {
		if (this.frameSyncService) {
			return;
		}

		this.frameSyncService = new FrameSyncService(
			(msg: MsgSyncFrame) => {
				// 处理帧数据中的伤害计算（服务端权威）
				this.processFrameDamage(msg.syncFrame);

				// 广播帧数据给房间内所有连接
				this.broadcastMsg("serverMsg/SyncFrame", msg);
			},
			60, // 60fps
			() => {
				// 状态快照回调函数 - 返回当前游戏状态
				// 这里需要收集房间内所有重要的游戏状态
				return this.getGameStateSnapshot();
			}
		);

		// 设置状态快照间隔为60帧（1秒更新一次）
		this.frameSyncService.setStateSnapshotInterval(60);

		this.frameSyncService.startSyncFrame();
		this.logger.log("[FrameSync] 帧同步已启动，状态快照间隔: 1秒");

		// 启动血量同步 - 定期广播权威血量
		this.startHpSync();
	}

	/**
	 * 启动血量同步 - 定期广播权威血量防止作弊和误差累积
	 */
	private startHpSync() {
		if (this.hpSyncTimer) {
			return;
		}

		// 初始化所有玩家的血量
		this.data.users.forEach((user) => {
			if (!this.userStates[user.id]) {
				this.userStates[user.id] = {};
			}
			if (this.userStates[user.id].hp === undefined) {
				this.userStates[user.id].hp = 100; // 初始血量
			}
		});

		// 每500ms广播一次权威血量
		this.hpSyncTimer = setInterval(() => {
			if (this.data.gamePhase === GamePhase.PLAYING && this.conns.length > 0) {
				// 收集所有玩家的血量
				const hpData: { [playerId: string]: number } = {};
				this.data.users.forEach((user) => {
					if (this.userStates[user.id]) {
						hpData[user.id] = this.userStates[user.id].hp ?? 100;
					}
				});

				// 广播权威血量
				this.broadcastMsg("serverMsg/HpSync", {
					hpData: hpData,
					timestamp: Date.now(),
				});

				for (const user of this.data.users) {
					if (this.userStates[user.id]) {
						if (this.userStates[user.id].hp <= 0) {
							this.broadcastMsg("serverMsg/GameOver", {
								time: new Date(),
								message: "游戏结束！",
								playerId: user.id,
							});
							this.stopHpSync();
							return;
						}
					}
				}
			}
		}, 500);

		this.logger.log("[HpSync] 血量同步已启动，间隔: 500ms");
	}

	/**
	 * 停止血量同步
	 */
	private stopHpSync() {
		if (this.hpSyncTimer) {
			clearInterval(this.hpSyncTimer);
			this.hpSyncTimer = null;
			this.logger.log("[HpSync] 血量同步已停止");
		}
	}

	/**
	 * 处理帧数据中的伤害计算（服务端权威）
	 * 客户端只负责碰撞检测和发送BeHit事件，服务器负责真实的伤害计算
	 */
	private processFrameDamage(frame: any) {
		if (this.isGameOver) return;
		if (!frame || !frame.connectionInputs) return;

		// 遍历所有输入，查找BeHit事件
		for (const connInput of frame.connectionInputs) {
			// 注意：字段名是 operates，不是 operations
			if (!connInput.operates) continue;

			for (const operation of connInput.operates) {
				// 只处理BeHit类型的输入
				if (operation.inputType === "BeHit") {
					const targetPlayerId = operation.playerId;
					const attackerId = connInput.connectionId;

					// 获取被攻击玩家的状态
					if (this.userStates[targetPlayerId]) {
						// 服务器计算伤害（这里可以添加更复杂的逻辑，如暴击、护甲等）
						const damage = 10;
						const oldHp = this.userStates[targetPlayerId].hp ?? 100;
						const newHp = Math.max(0, oldHp - damage);

						this.userStates[targetPlayerId].hp = newHp;
						if (newHp <= 0) {
							this.isGameOver = true;
						}
						this.logger.log(`[伤害计算] ${attackerId} 击中 ${targetPlayerId}，伤害: ${damage}，血量: ${oldHp} → ${newHp}`);
					}
				}
			}
		}
	}

	/**
	 * 获取游戏状态快照
	 * 返回当前房间的完整游戏状态，用于断线重连
	 */
	private getGameStateSnapshot(): any {
		return {
			timestamp: Date.now(),
			frameIndex: this.frameSyncService?.getCurrentFrameIndex() || 0,
			roomData: {
				id: this.data.id,
				users: this.data.users.map((user) => ({
					id: user.id,
					nickname: user.nickname,
					isReady: user.isReady,
					isOffline: user.isOffline,
					color: user.color,
				})),
			},
			// 保存所有用户的游戏状态（位置、血量等）
			userStates: { ...this.userStates },
			// 其他游戏相关状态可以在这里添加
		};
	}

	/**
	 * 停止帧同步
	 */
	stopFrameSync() {
		if (this.frameSyncService) {
			this.frameSyncService.stopSyncFrame();
			this.frameSyncService = null;
			this.logger.log("[FrameSync] 帧同步已停止");
		}
		// 同时停止血量同步
		this.stopHpSync();
	}

	/**
	 * 获取帧同步服务
	 */
	getFrameSyncService(): FrameSyncService | null {
		return this.frameSyncService;
	}

	/**
	 * 暂停帧同步
	 */
	pauseFrameSync() {
		if (this.frameSyncService) {
			this.frameSyncService.pauseSyncFrame();
			this.logger.log("[FrameSync] 帧同步已暂停");
		} else {
			this.logger.warn("[FrameSync] 帧同步服务未启动，无法暂停");
		}
	}

	/**
	 * 恢复帧同步
	 */
	resumeFrameSync() {
		if (this.frameSyncService) {
			this.frameSyncService.resumeSyncFrame();
			this.logger.log("[FrameSync] 帧同步已恢复");
		} else {
			this.logger.warn("[FrameSync] 帧同步服务未启动，无法恢复");
		}
	}

	private _intervals: ReturnType<typeof setInterval>[] = [];
	private _setInterval(func: () => void, interval: number) {
		this._intervals.push(setInterval(func, interval));
	}
}
