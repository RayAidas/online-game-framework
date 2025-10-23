import { _decorator, Button, Color, Component, EditBox, instantiate, Label, Layout, Node, Prefab, RichText, ScrollView, UITransform } from "cc";
import { MsgChat } from "db://assets/scripts/shared/protocols/roomServer/serverMsg/MsgChat";
import { ServiceType as RoomServiceType } from "db://assets/scripts/shared/protocols/serviceProto_roomServer";
import { FrameSyncClient, IFrameSyncConnect, InputHandler } from "db://assets/scripts/shared/services/FrameSyncClient";
import { MsgAfterFrames, MsgInpFrame, MsgRequireSyncState, MsgSyncFrame, MsgSyncState } from "db://assets/scripts/shared/types/FrameSync";
import { RoomData } from "db://assets/scripts/shared/types/RoomData";
import { UserInfo } from "db://assets/scripts/shared/types/UserInfo";
import { WsClient } from "tsrpc-browser";
import { GameBase } from "./GameBase";

const { ccclass, property } = _decorator;

@ccclass("RoomPanel")
export class RoomPanel extends Component {
	@property(Label) roomIdLabel: Label = null!;
	@property(Label) roomNameLabel: Label = null!;
	@property(Label) ownerLabel: Label = null!;
	@property(Label) userCountLabel: Label = null!;
	@property(ScrollView) userListScrollView: ScrollView = null!;
	@property(Prefab) userItemTemplate: Prefab = null!;
	@property(Button) readyButton: Button = null!;
	@property(Label) readyStatusLabel: Label = null!;
	@property(Label) userAlreadyReadyLabel: Label = null!;
	@property(ScrollView) chatListScrollView: ScrollView = null!;
	@property(Prefab) chatItemTemplate: Prefab = null!;
	@property(EditBox) chatInput: EditBox = null!;
	@property(Prefab) gamePrefab: Prefab = null!;

	private roomClient: WsClient<RoomServiceType>;
	private currentRoomData: RoomData | null = null;
	private currentUser: UserInfo | null = null;
	// 帧同步客户端
	private frameSyncClient: FrameSyncClient | null = null;
	public game: GameBase = null!;

	start() {
		this.updateRoomInfo();
	}

	update(deltaTime: number) {}

	private setupEventListeners() {
		// 监听用户加入
		this.roomClient.listenMsg("serverMsg/UserJoin", (msg) => {
			console.log("用户加入:", msg.user);
			this.handleUserJoin(msg);
		});

		// 监听用户离开
		this.roomClient.listenMsg("serverMsg/UserExit", (msg) => {
			console.log("用户离开:", msg.user);
			this.handleUserExit(msg);
		});

		// 监听房主变更
		this.roomClient.listenMsg("serverMsg/OwnerChanged", (msg) => {
			console.log("房主变更:", msg.oldOwner, "->", msg.newOwner);
			this.handleOwnerChanged(msg);
		});

		// 监听用户准备状态变更
		this.roomClient.listenMsg("serverMsg/UserReadyChanged", (msg) => {
			console.log("用户准备状态变更:", msg.user.nickname, "准备状态:", msg.isReady);
			this.handleUserReadyChanged(msg);
		});

		// 监听游戏开始消息
		this.roomClient.listenMsg("serverMsg/GameStarted", (msg) => {
			console.log("游戏开始:", msg.message);
			this.handleGameStarted(msg);
		});

		// 监听用户离线消息
		this.roomClient.listenMsg("serverMsg/UserOffline", (msg) => {
			console.log("用户离线:", msg.user);
			this.handleUserOffline(msg);
		});

		// 监听用户上线消息
		this.roomClient.listenMsg("serverMsg/UserOnline", (msg) => {
			console.log("用户上线:", msg.user);
			this.handleUserOnline(msg);
		});

		// 监听帧同步消息
		this.roomClient.listenMsg("serverMsg/SyncFrame", (msg) => {
			console.log("收到帧同步数据:", msg.frameIndex);
			this.handleSyncFrame(msg);
		});

		this.roomClient.listenMsg("serverMsg/Chat", (msg) => {
			console.log("收到聊天消息:", msg.content);
			this.handleChat(msg);
		});

		this.roomClient.listenMsg("serverMsg/GameOver", (msg) => {
			console.log("收到游戏结束消息:", msg.message);
			this.handleGameOver(msg);
		});
	}

	private updateRoomInfo() {
		if (!this.currentRoomData) {
			this.clearRoomInfo();
			return;
		}

		// 更新房间基本信息
		if (this.roomIdLabel) {
			this.roomIdLabel.string = `房间ID: ${this.currentRoomData.id}`;
		}

		if (this.roomNameLabel) {
			this.roomNameLabel.string = `房间名称: ${this.currentRoomData.name}`;
		}

		if (this.ownerLabel) {
			const owner = this.currentRoomData.users.find((user) => user.id === this.currentRoomData!.ownerId);
			this.ownerLabel.string = `房主: ${owner ? owner.nickname : "未知"}`;
		}

		if (this.userCountLabel) {
			this.userCountLabel.string = `用户数量: ${this.currentRoomData.users.length}/${this.currentRoomData.maxUser}`;
		}

		// 更新已准备玩家数量显示
		this.updateReadyCount();

		// 更新用户列表
		this.updateUserList();

		// 更新准备状态显示
		this.updateReadyStatus();
	}

	private updateReadyCount() {
		if (!this.currentRoomData) {
			if (this.userAlreadyReadyLabel) {
				this.userAlreadyReadyLabel.string = "已准备: 0/0";
			}
			return;
		}

		// 计算已准备的玩家数量
		const readyCount = this.currentRoomData.users.filter((user) => user.isReady).length;
		const totalCount = this.currentRoomData.users.length;

		if (this.userAlreadyReadyLabel) {
			this.userAlreadyReadyLabel.string = `已准备: ${readyCount}/${totalCount}`;
		}
	}

	private updateUserList() {
		if (!this.userListScrollView || !this.userItemTemplate || !this.currentRoomData) {
			return;
		}

		const content = this.userListScrollView.content;

		// 清除现有用户项
		content.removeAllChildren();

		// 创建用户项
		this.currentRoomData.users.forEach((user, index) => {
			const userItem = this.createUserItem(user, index);
			content.addChild(userItem);
		});

		// 更新布局
		const layout = content.getComponent(Layout);
		if (layout) {
			layout.updateLayout();
		}
	}

	private createUserItem(user: UserInfo & { color: { r: number; g: number; b: number } }, index: number): Node {
		const userItem = instantiate(this.userItemTemplate);
		const nameLabel = userItem.getComponent(RichText);
		if (nameLabel) {
			let richText = "";

			// 添加房主标识
			if (user.id === this.currentRoomData?.ownerId) {
				richText += "<color=#FFD700>👑</color> ";
			}

			// 添加当前用户标识
			if (user.id === this.currentUser?.id) {
				richText += "<color=#00FF00>★</color> ";
			}

			// 添加在线/离线状态标识
			const isOffline = user.isOffline || false;
			if (isOffline) {
				richText += "<color=#808080>⚫</color> "; // 灰色圆点表示离线
			} else {
				richText += "<color=#00FF00>🟢</color> "; // 绿色圆点表示在线
			}

			// 添加用户名(带颜色，如果离线则变暗)
			const colorHex = `${user.color.r.toString(16).padStart(2, "0")}${user.color.g.toString(16).padStart(2, "0")}${user.color.b
				.toString(16)
				.padStart(2, "0")}`;

			if (isOffline) {
				// 离线用户名字颜色变暗
				richText += `<color=#808080>${user.nickname} (离线)</color>`;
			} else {
				richText += `<color=#${colorHex}>${user.nickname}</color>`;
			}

			// 添加准备状态
			const isReady = user.isReady || false;
			richText += ` ${isReady ? "<color=#00FF00>✅已准备</color>" : "<color=#FF0000>❌未准备</color>"}`;

			nameLabel.string = richText;
		}

		// 设置位置
		userItem.setPosition(0, -index * 50 - 20, 0);

		return userItem;
	}

	private clearRoomInfo() {
		// 停止帧同步
		this.stopFrameSync();

		if (this.roomIdLabel) {
			this.roomIdLabel.string = "房间ID: 无";
		}

		if (this.roomNameLabel) {
			this.roomNameLabel.string = "房间名称: 无";
		}

		if (this.ownerLabel) {
			this.ownerLabel.string = "房主: 无";
		}

		if (this.userCountLabel) {
			this.userCountLabel.string = "用户数量: 0/0";
		}

		if (this.userAlreadyReadyLabel) {
			this.userAlreadyReadyLabel.string = "已准备: 0/0";
		}

		// 清空用户列表
		if (this.userListScrollView) {
			this.userListScrollView.content.removeAllChildren();
		}

		// 重置准备状态
		this.updateReadyStatus();
	}

	private updateReadyStatus() {
		if (!this.currentRoomData || !this.currentUser) {
			if (this.readyStatusLabel) {
				this.readyStatusLabel.string = "准备状态: 未登录";
			}
			if (this.readyButton) {
				this.readyButton.node.active = false;
			}
			return;
		}
		// 找到当前用户在房间中的信息
		const currentUserInRoom = this.currentRoomData.users.find((user) => user.id === this.currentUser!.id);
		const isReady = currentUserInRoom?.isReady || false;

		// 更新准备状态标签
		if (this.readyStatusLabel) {
			this.readyStatusLabel.string = `准备状态: ${isReady ? "已准备" : "未准备"}`;
		}

		// 更新准备按钮
		if (this.readyButton) {
			this.readyButton.node.active = true;
			const buttonLabel = this.readyButton.getComponentInChildren(Label);
			if (buttonLabel) {
				buttonLabel.string = isReady ? "取消准备" : "准备";
			}
		}
	}

	private onRefreshClick() {
		console.log("刷新房间信息");
		this.updateRoomInfo();
	}

	// 准备/取消准备按钮点击事件
	public onReadyClick() {
		console.log("🎯 onReadyClick 方法被调用");

		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		if (!this.currentRoomData) {
			console.log("您不在任何房间中");
			return;
		}

		// 找到当前用户在房间中的信息
		const currentUserInRoom = this.currentRoomData.users.find((user) => user.id === this.currentUser!.id);
		const isReady = currentUserInRoom?.isReady || false;

		console.log(`🎯 准备设置准备状态为: ${!isReady}`);

		// 检查连接状态并尝试连接
		this.ensureConnection()
			.then(() => {
				console.log("🎯 连接已建立，调用 callSetReady");
				this.callSetReady(!isReady);
			})
			.catch((err) => {
				console.error("无法建立连接:", err);
			});
	}

	// 实际调用设置准备状态 API
	private callSetReady(isReady: boolean) {
		this.roomClient
			.callApi("SetReady", {
				isReady: isReady,
			})
			.then((ret) => {
				if (ret.isSucc) {
					console.log(`设置准备状态成功: ${isReady ? "已准备" : "未准备"}`);
					// 立即更新本地数据
					this.updateLocalReadyStatus(isReady);
				} else {
					console.error("设置准备状态失败:", ret.err);
				}
			})
			.catch((err) => {
				console.error("设置准备状态 API 调用异常:", err);
			});
	}

	// 更新本地准备状态
	private updateLocalReadyStatus(isReady: boolean) {
		if (!this.currentRoomData || !this.currentUser) {
			return;
		}

		// 找到当前用户在房间中的信息并更新准备状态
		const currentUserInRoom = this.currentRoomData.users.find((user) => user.id === this.currentUser!.id);
		if (currentUserInRoom) {
			currentUserInRoom.isReady = isReady;
			console.log(`本地更新用户 ${this.currentUser.id} 准备状态为: ${isReady}`);
			// 更新UI
			this.updateReadyCount();
			this.updateReadyStatus();
		}
	}

	// 处理用户加入
	private handleUserJoin(msg: any) {
		if (!this.currentRoomData) {
			return;
		}

		// 检查用户是否已经存在（避免重复添加）
		const existingUser = this.currentRoomData.users.find((user) => user.id === msg.user.id);
		if (!existingUser) {
			// 添加新用户到房间数据
			this.currentRoomData.users.push({
				...msg.user,
				color: msg.color,
				isReady: false, // 新用户默认为未准备状态
			});
			console.log(`添加用户 ${msg.user.nickname} 到房间数据，当前用户数: ${this.currentRoomData.users.length}`);
		}

		// 更新UI
		this.updateRoomInfo();
	}

	// 处理用户离开
	private handleUserExit(msg: any) {
		if (!this.currentRoomData) {
			return;
		}

		// 从房间数据中移除用户
		const userIndex = this.currentRoomData.users.findIndex((user) => user.id === msg.user.id);
		if (userIndex !== -1) {
			this.currentRoomData.users.splice(userIndex, 1);
			console.log(`移除用户 ${msg.user.nickname} 从房间数据，当前用户数: ${this.currentRoomData.users.length}`);
		}

		// 更新UI
		this.updateRoomInfo();
	}

	// 处理房主变更
	private handleOwnerChanged(msg: any) {
		if (!this.currentRoomData) {
			return;
		}

		// 更新房主ID
		this.currentRoomData.ownerId = msg.newOwner.id;
		console.log(`房主变更为: ${msg.newOwner.nickname}`);

		// 更新UI
		this.updateRoomInfo();
	}

	// 处理用户准备状态变更
	private handleUserReadyChanged(msg: any) {
		if (!this.currentRoomData) {
			return;
		}

		// 找到用户并更新准备状态
		const user = this.currentRoomData.users.find((u) => u.id === msg.user.id);
		if (user) {
			user.isReady = msg.isReady;
			console.log(`用户 ${msg.user.nickname} 准备状态变更为: ${msg.isReady}`);
		}

		// 更新UI
		this.updateRoomInfo();
	}
	// 确保连接已建立
	private ensureConnection(): Promise<void> {
		return new Promise((resolve, reject) => {
			// 尝试连接（每次都尝试，让 WsClient 自己处理重复连接）
			this.roomClient
				.connect()
				.then(() => {
					console.log("WebSocket 连接已建立");
					resolve();
				})
				.catch((err) => {
					console.error("WebSocket 连接失败:", err);
					reject(err);
				});
		});
	}

	// 退出房间
	public onExitRoomClick() {
		console.log("🚪 onExitRoomClick 方法被调用");

		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		// 检查连接状态并尝试连接
		this.ensureConnection()
			.then(() => {
				console.log("🚪 连接已建立，调用 callExitRoom");
				this.callExitRoom();
			})
			.catch((err) => {
				console.error("无法建立连接:", err);
			});
	}

	// 实际调用退出房间 API
	private callExitRoom() {
		this.roomClient
			.callApi("ExitRoom", {})
			.then((ret) => {
				if (ret.isSucc) {
					console.log("退出房间成功");
					// 清空房间数据
					this.currentRoomData = null;
					this.updateRoomInfo();
					// 断开与服务器的连接
					this.roomClient
						.disconnect()
						.then(() => {
							this.node.active = false;
							console.log("已断开与服务器的连接");
						})
						.catch((err) => {
							console.error("断开连接失败:", err);
						});
				} else {
					console.error("退出房间失败:", ret.err);
				}
			})
			.catch((err) => {
				console.error("退出房间 API 调用异常:", err);
				// 即使API调用失败，也尝试断开连接
				this.roomClient.disconnect().catch((disconnectErr) => {
					console.error("强制断开连接失败:", disconnectErr);
				});
			});
	}

	// 设置当前房间数据（由外部调用）
	public setCurrentRoom(roomData: RoomData, user: UserInfo, roomClient: WsClient<RoomServiceType>) {
		this.currentRoomData = roomData;
		this.currentUser = user;
		this.roomClient = roomClient;
		this.setupEventListeners();
		this.updateRoomInfo();
		this.initFrameSync();
		Math.randomSeed = this.currentRoomData.seed;
	}

	// 获取当前房间数据
	public getCurrentRoom(): RoomData | null {
		return this.currentRoomData;
	}

	/**
	 * 初始化帧同步
	 */
	private initFrameSync() {
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
	private stopFrameSync() {
		if (this.frameSyncClient) {
			this.frameSyncClient.stopExecuteFrame();
			this.frameSyncClient = null;
			console.log("帧同步已停止");
		}
	}

	/**
	 * 处理游戏开始消息
	 */
	private handleGameStarted(msg: any) {
		if (this.isFrameSyncPaused()) this.resumeFrameSync();
		let gameNode = instantiate(this.gamePrefab);
		this.game = gameNode.getComponent(GameBase);
		this.game.init(this.roomClient);
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
	private handleSyncFrame(msg: any) {
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

	private handleChat(msg: MsgChat) {
		let item = this.createChatItem(msg);
		this.chatListScrollView.content.addChild(item);
		item.setPosition(0, -(this.chatListScrollView.content.children.length - 1) * 100, 0);
		this.chatListScrollView.content.getComponent(UITransform).height = this.chatListScrollView.content.children.length * 100;
		if (this.chatListScrollView.content.getComponent(UITransform).height > this.chatListScrollView.node.getComponent(UITransform).height) {
			this.chatListScrollView.scrollToBottom(0);
		}
	}

	private handleGameOver(msg: any) {
		this.game?.showOverPanel(msg.playerId);
		this.scheduleOnce(() => {
			this.pauseFrameSync();
		}, 2);
		this.game = null;
	}

	private handleUserOffline(msg: any) {
		if (this.currentRoomData) {
			const user = this.currentRoomData.users.find((u) => u.id === msg.user.id);
			if (user) {
				user.isOffline = true;
				// 更新用户列表显示
				this.updateUserList();
			}
		}
	}

	private handleUserOnline(msg: any) {
		if (this.currentRoomData) {
			const user = this.currentRoomData.users.find((u) => u.id === msg.user.id);
			if (user) {
				user.isOffline = false;
				// 更新用户列表显示
				this.updateUserList();
			}
		}
	}

	private createChatItem(msg: any): Node {
		const chatItem = instantiate(this.chatItemTemplate);
		let nameLabel = chatItem.getChildByName("name").getComponent(Label);

		// 从当前房间用户列表中找到发送消息的用户
		const user = this.currentRoomData?.users.find((u) => u.id === msg.user.id);
		if (user) {
			nameLabel.color = new Color(user.color.r, user.color.g, user.color.b, 255);
		}

		nameLabel.string = msg.user.nickname;
		chatItem.getChildByName("content").getComponent(Label).string = msg.content;
		chatItem.getChildByName("time").getComponent(Label).string = msg.time.toLocaleString();
		return chatItem;
	}

	public sendChatMessage() {
		const content = this.chatInput.string;
		if (content) {
			this.roomClient.callApi("SendChat", { content });
			this.chatInput.string = "";
		}
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
				this.game = gameNode.getComponent(GameBase);
				this.game.init(this.roomClient);
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
											this.game.isGameOver = true;
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
	private requestGameState(): Promise<any> {
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
