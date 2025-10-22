import { PrefixLogger } from "tsrpc";
import { roomServer } from "../../roomServer";
import { FrameSyncService } from "../../services/FrameSyncService";
import { RoomStateService } from "../../services/RoomStateService";
import { MsgUpdateRoomState } from "../../shared/protocols/roomServer/clientMsg/MsgUpdateRoomState";
import { ServiceType } from "../../shared/protocols/serviceProto_roomServer";
import { MsgSyncFrame } from "../../shared/types/FrameSync";
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
	finishNum: number = 0;
	/**帧同步服务*/
	private frameSyncService: FrameSyncService | null = null;

	constructor(data: RoomData) {
		this.data = data;
		this.overNum = 0;
		this.finishNum = 0;
		this.logger = new PrefixLogger({
			logger: roomServer.logger,
			prefixs: [`[Room ${data.id}]`],
		});

		// 每 100ms 同步一次 UserState
		// this._setInterval(() => {
		// 	this.broadcastMsg("serverMsg/UserStates", {
		// 		userStates: this.userStates,
		// 	});
		// }, 100);
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
							// 移除 id 字段，因为服务器不需要保存视角信息
							id: undefined,
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
			// 只取消监听消息，不关闭连接
			this.unlistenMsgs(conn);
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
				gamePhase: this.data.gamePhase,
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
