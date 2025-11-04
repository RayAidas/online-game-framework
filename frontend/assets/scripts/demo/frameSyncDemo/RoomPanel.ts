import { _decorator, instantiate } from "cc";
import { ServiceType as RoomServiceType } from "db://assets/scripts/shared/protocols/serviceProto_roomServer";
import { FrameSyncClient, IFrameSyncConnect, InputHandler } from "db://assets/scripts/shared/services/FrameSyncClient";
import { MsgAfterFrames, MsgInpFrame, MsgRequireSyncState, MsgSyncFrame, MsgSyncState } from "db://assets/scripts/shared/types/FrameSync";
import { RoomData } from "db://assets/scripts/shared/types/RoomData";
import { UserInfo } from "db://assets/scripts/shared/types/UserInfo";
import { WsClient } from "tsrpc-browser";
import { RoomBase } from "../RoomBase";
import { GameDemo } from "./GameDemo";

const { ccclass, property } = _decorator;

@ccclass("RoomPanel")
export class RoomPanel extends RoomBase {
	// 帧同步客户端
	public frameSyncClient: FrameSyncClient | null = null;
	public game: GameDemo = null!;

	update(deltaTime: number) {}

	public setupEventListeners() {
		super.setupEventListeners();

		// 监听服务器血量同步消息（权威血量，防止作弊和误差）
		this.roomClient.listenMsg("serverMsg/HpSync", (msg) => {
			this.handleHpSync(msg);
		});

		// 监听帧同步消息
		this.roomClient.listenMsg("serverMsg/SyncFrame", (msg) => {
			console.log("收到帧同步数据:", msg.frameIndex);
			this.handleSyncFrame(msg);
		});
	}

	public clearRoomInfo() {
		// 停止帧同步
		this.stopFrameSync();
		super.clearRoomInfo();
	}

	/**
	 * 处理服务器血量同步 - 权威血量，防止作弊和误差累积
	 */
	public handleHpSync(msg: any) {
		if (!this.game || !msg.hpData) {
			return;
		}

		// 将服务器的权威血量传递给游戏实例进行校正
		if (typeof this.game.syncAuthorityHp === "function") {
			this.game.syncAuthorityHp(msg.hpData);
		}
	}

	// 设置当前房间数据（由外部调用）
	public setCurrentRoom(roomData: RoomData, user: UserInfo, roomClient: WsClient<RoomServiceType>) {
		super.setCurrentRoom(roomData, user, roomClient);
		this.initFrameSync();
	}

	/**
	 * 初始化帧同步
	 */
	public initFrameSync() {
		if (!this.roomClient || !this.currentUser) {
			return;
		}

		// 创建帧同步连接适配器
		const frameSyncConnect: IFrameSyncConnect = {
			onAfterFrames: (msg: MsgAfterFrames) => {
				console.log("收到追帧数据:", msg);
			},
			onSyncFrame: (msg: MsgSyncFrame) => {
				console.log("收到同步帧:", msg.frameIndex);
				this.handleSyncFrame(msg);
			},
			onRequireSyncState: (msg: MsgRequireSyncState) => {
				console.log("请求状态同步:", msg);
			},
			sendSyncState: (msg: MsgSyncState) => {
				// 通过房间客户端发送状态同步数据
				console.log("发送状态同步数据:", msg);
				// TODO: 实现状态同步消息发送
			},
			sendInpFrame: (msg: MsgInpFrame) => {
				// 通过房间客户端发送输入帧
				this.roomClient?.callApi("SendInput", msg);
			},
			disconnect: () => {
				console.log("帧同步连接断开");
			},
		};

		// 创建输入处理器
		const inputHandler: InputHandler = {
			execInput_Move: (connId: string, inputFrame: any, dt: number) => {
				console.log("执行移动输入:", connId, inputFrame, dt);
				// 在这里处理移动逻辑
			},
			execInput_Attack: (connId: string, inputFrame: any, dt: number) => {
				console.log("执行攻击输入:", connId, inputFrame, dt);
				// 在这里处理攻击逻辑
			},
		};

		// 创建帧同步客户端
		this.frameSyncClient = new FrameSyncClient(
			frameSyncConnect,
			inputHandler,
			(stateData: any, stateFrameIndex: number) => {
				console.log("状态同步数据:", stateData, stateFrameIndex);
			},
			(dt: number, frameIndex: number) => {
				console.log("执行帧:", frameIndex, dt);
				// 在这里处理每帧的游戏逻辑
			},
			() => {
				// 获取当前游戏状态
				return {
					roomData: this.currentRoomData,
					userData: this.currentUser,
				};
			}
		);

		// 开始执行帧
		this.frameSyncClient.startExecuteFrame();
		console.log("帧同步客户端已初始化");
	}

	/**
	 * 发送输入操作
	 */
	public sendInput(inputType: string, data: any) {
		if (this.frameSyncClient) {
			this.frameSyncClient.sendInputFrame({
				inputType: inputType,
				...data,
			});
		}
	}

	/**
	 * 停止帧同步
	 */
	public stopFrameSync() {
		if (this.frameSyncClient) {
			this.frameSyncClient.stopExecuteFrame();
			this.frameSyncClient = null;
			console.log("帧同步已停止");
		}
	}

	/**
	 * 处理游戏开始消息
	 */
	public handleGameStarted(msg: any) {
		if (this.isFrameSyncPaused()) this.resumeFrameSync();
		let gameNode = instantiate(this.gamePrefab);
		this.game = gameNode.getComponent(GameDemo);
		this.game.init(this.roomClient, this.currentRoomData);
		this.node.parent.addChild(gameNode);
		this.callSetReady(false);
		if (this.game) {
			// 为房间内所有用户创建玩家节点
			if (this.currentRoomData && this.currentUser) {
				this.currentRoomData.users.forEach((user) => {
					const isCurrentPlayer = user.id === this.currentUser!.id;
					this.game.createPlayer(user, isCurrentPlayer);
				});
			}

			// 监听GameDemo的玩家移动事件
			this.game.node.on("playerInput", (inputData: any) => {
				this.sendInput(inputData.inputType, inputData);
			});
		}
	}

	/**
	 * 处理帧同步消息
	 */
	public handleSyncFrame(msg: any) {
		if (!this.game) return;
		// 这里可以处理帧同步数据，更新游戏状态
		// 例如：更新其他玩家的位置等
		if (msg.syncFrame && msg.syncFrame.connectionInputs) {
			msg.syncFrame.connectionInputs.forEach((connectionInput: any) => {
				// 跳过当前用户的输入，因为当前用户的位置已经在本地更新了
				if (this.currentUser && connectionInput.connectionId === this.currentUser.id.toString()) {
					return;
				}

				// 处理每个连接的输入
				connectionInput.operates.forEach((operate: any) => {
					this.game.syncFrame(connectionInput, operate);
				});
			});
		}
	}

	public handleGameOver(msg: any) {
		if (!this.game) return;
		this.game?.showOverPanel(msg.playerId);
		this.scheduleOnce(() => {
			this.pauseFrameSync();
		}, 1);
		this.game.gameOver(msg.playerId);
		this.game = null;
	}

	/**
	 * 暂停帧同步
	 * 暂停后客户端不再接收和执行帧数据
	 */
	public pauseFrameSync() {
		if (this.frameSyncClient) {
			this.frameSyncClient.pauseFrameSync();
			this.roomClient.callApi("PauseFrameSync", {});
			console.log("RoomPanel: 帧同步已暂停");
		} else {
			console.warn("RoomPanel: 帧同步客户端未初始化");
		}
	}

	/**
	 * 恢复帧同步
	 * 继续接收和执行帧数据
	 */
	public resumeFrameSync() {
		if (this.frameSyncClient) {
			this.frameSyncClient.resumeFrameSync();
			this.roomClient.callApi("ResumeFrameSync", {});
			console.log("RoomPanel: 帧同步已恢复");
		} else {
			console.warn("RoomPanel: 帧同步客户端未初始化");
		}
	}

	/**
	 * 检查帧同步是否暂停
	 */
	public isFrameSyncPaused(): boolean {
		if (this.frameSyncClient) {
			return this.frameSyncClient.isPaused();
		}
		return false;
	}

	/**
	 * 重连游戏 - 当用户在游戏中断线后重连
	 * 恢复游戏界面和状态
	 */
	public rejoinGame() {
		if (!this.currentRoomData || !this.game) {
			console.log("重连游戏：创建游戏实例");
			// 如果游戏实例不存在，创建游戏
			if (this.gamePrefab) {
				if (this.isFrameSyncPaused()) this.resumeFrameSync();
				let gameNode = instantiate(this.gamePrefab);
				this.game = gameNode.getComponent(GameDemo);
				this.game.init(this.roomClient, this.currentRoomData);
				this.node.parent.addChild(gameNode);

				// 延迟创建玩家节点，等待状态同步完成后再创建
				// 这样可以根据实际的游戏状态来创建玩家位置
				// 先请求游戏状态和追帧数据来同步
				this.requestGameState().then((serverState) => {
					// 为房间内所有用户创建玩家节点
					if (this.currentRoomData && this.currentUser) {
						this.currentRoomData.users.forEach((user) => {
							// 跳过离线用户
							// if (user.isOffline) return;

							const isCurrentPlayer = user.id === this.currentUser!.id;

							// 从服务器状态中获取玩家位置（如果有）
							let initialPosition = undefined;
							if (serverState && serverState.userStates && serverState.userStates[user.id]) {
								const userState = serverState.userStates[user.id];
								if (userState.x !== undefined && userState.y !== undefined) {
									initialPosition = { x: userState.x, y: userState.y, z: 0 };
								}
							}

							this.game.createPlayer(user, isCurrentPlayer, initialPosition);
						});

						// 创建玩家节点后，只应用血量等其他状态
						// 注意：不要再次应用位置，因为 createPlayer 已经正确设置了位置
						if (serverState && serverState.userStates) {
							// 只更新血量，不更新位置
							Object.keys(serverState.userStates).forEach((playerId) => {
								const state = serverState.userStates[playerId];
								if (state.hp !== undefined) {
									const playerInfo = this.game.playerInfos.find((info: any) => info.playerId === playerId);
									if (playerInfo) {
										const hpDiff = state.hp - playerInfo.hp;
										playerInfo.updateHp(hpDiff);
										console.log(`重连后更新玩家 ${playerId} 血量: ${state.hp}`);
										if (playerInfo.hp <= 0) {
											this.game.gameOver(playerId);
											this.game.showOverPanel(playerId);
										}
									}
								}
							});
						}
					}
				});

				// 监听玩家输入事件
				this.game.node.on("playerInput", (inputData: any) => {
					this.sendInput(inputData.inputType, inputData);
				});
			}
		} else {
			console.log("重连游戏：游戏实例已存在");
		}
	}

	/**
	 * 请求游戏状态 - 重连时同步游戏状态和帧数据
	 * @returns Promise<any> 返回服务器状态数据（包含 userStates）
	 */
	public requestGameState(): Promise<any> {
		return new Promise((resolve, reject) => {
			console.log("请求游戏状态和追帧数据...");

			this.roomClient
				.callApi("RequestGameState", {})
				.then((ret) => {
					if (ret.isSucc) {
						console.log("收到游戏状态:");
						console.log("  状态帧索引:", ret.res.stateFrameIndex);
						console.log("  当前帧索引:", ret.res.currentFrameIndex);
						console.log("  追帧数量:", ret.res.afterFrames.length);
						console.log("  状态数据:", ret.res.stateData);

						// 将状态和追帧数据应用到帧同步客户端
						if (this.frameSyncClient) {
							// 应用状态数据
							if (ret.res.stateData && ret.res.stateFrameIndex >= 0) {
								this.frameSyncClient.onSyncStateData(ret.res.stateData, ret.res.stateFrameIndex);
								console.log("状态数据已应用到帧同步客户端");
							}

							// 如果有追帧数据，应用追帧
							if (ret.res.afterFrames && ret.res.afterFrames.length > 0) {
								this.frameSyncClient.onAfterFrames({
									afterFrames: ret.res.afterFrames,
									startFrameIndex: ret.res.startFrameIndex,
								});
								console.log("追帧数据已应用，开始追帧...");
							}
						}

						console.log("游戏状态同步完成");
						// 返回状态数据供 rejoinGame 使用
						resolve(ret.res.stateData);
					} else {
						console.error("请求游戏状态失败:", ret.err);
						reject(new Error(ret.err.message));
					}
				})
				.catch((err) => {
					console.error("请求游戏状态异常:", err);
					reject(err);
				});
		});
	}
}
