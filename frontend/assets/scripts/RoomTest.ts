import { _decorator, Button, Color, Component, instantiate, Label, Layout, Node, ScrollView, Sprite, Vec3 } from "cc";
import { WsClient } from "tsrpc-browser";
import { GameTest } from "./GameTest";
import { ServiceType as RoomServiceType } from "./shared/protocols/serviceProto_roomServer";
import { FrameSyncClient, IFrameSyncConnect, InputHandler } from "./shared/services/FrameSyncClient";
import { MsgAfterFrames, MsgInpFrame, MsgRequireSyncState, MsgSyncFrame, MsgSyncState } from "./shared/types/FrameSync";
import { RoomData } from "./shared/types/RoomData";
import { UserInfo } from "./shared/types/UserInfo";

const { ccclass, property } = _decorator;

@ccclass("RoomTest")
export class RoomTest extends Component {
	@property(Label) roomIdLabel: Label = null!;
	@property(Label) roomNameLabel: Label = null!;
	@property(Label) ownerLabel: Label = null!;
	@property(Label) userCountLabel: Label = null!;
	@property(ScrollView) userListScrollView: ScrollView = null!;
	@property(Node) userItemTemplate: Node = null!;
	@property(Button) readyButton: Button = null!;
	@property(Label) readyStatusLabel: Label = null!;
	@property(Label) userAlreadyReadyLabel: Label = null!;
	@property(GameTest) gameTest: GameTest = null!;

	private roomClient: WsClient<RoomServiceType>;
	private currentRoomData: RoomData | null = null;
	private currentUser: UserInfo | null = null;
	// 帧同步客户端
	private frameSyncClient: FrameSyncClient | null = null;

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

		// 监听帧同步消息
		this.roomClient.listenMsg("serverMsg/SyncFrame", (msg) => {
			console.log("收到帧同步数据:", msg.frameIndex);
			this.handleSyncFrame(msg);
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
		if (readyCount == this.currentRoomData.maxUser) {
			this.gameTest.node.active = true;
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

		// 设置用户信息
		const nameLabel = userItem.getChildByName("NameLabel")?.getComponent(Label);
		if (nameLabel) {
			nameLabel.string = user.nickname;
			// 如果是房主，添加标识
			if (user.id === this.currentRoomData?.ownerId) {
				nameLabel.string = `👑 ${user.nickname}`;
				nameLabel.color = new Color(255, 215, 0); // 金色
			}
		}

		const idLabel = userItem.getChildByName("IdLabel")?.getComponent(Label);
		if (idLabel) {
			idLabel.string = `ID: ${user.id}`;
		}

		// 设置准备状态
		const readyLabel = userItem.getChildByName("ReadyLabel")?.getComponent(Label);
		if (readyLabel) {
			const isReady = user.isReady || false;
			readyLabel.string = isReady ? "✅ 已准备" : "❌ 未准备";
			readyLabel.color = isReady ? new Color(0, 255, 0) : new Color(255, 0, 0);
		}

		// 设置用户颜色指示器
		const colorIndicator = userItem.getChildByName("ColorIndicator");
		if (colorIndicator) {
			const sprite = colorIndicator.getComponent(Sprite);
			if (sprite) {
				const color = new Color(user.color.r, user.color.g, user.color.b, 255);
				sprite.color = color;
			}
		}

		// 设置位置
		userItem.setPosition(0, -index * 30, 0);

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
		if (this.gameTest) {
			// 为房间内所有用户创建玩家节点
			if (this.currentRoomData && this.currentUser) {
				this.currentRoomData.users.forEach((user) => {
					const isCurrentPlayer = user.id === this.currentUser!.id;
					this.gameTest.createPlayer(user.id, isCurrentPlayer);
				});
			}

			// 监听GameTest的玩家移动事件
			this.gameTest.node.on("playerMove", (inputData: any) => {
				this.sendInput(inputData.inputType, {
					x: inputData.x,
					y: inputData.y,
					timestamp: inputData.timestamp,
				});
			});
		}
	}

	/**
	 * 处理帧同步消息
	 */
	private handleSyncFrame(msg: any) {
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
					if (operate.inputType === "Move") {
						// 更新其他玩家位置
						this.gameTest.updatePlayerPosition(connectionInput.connectionId, new Vec3(operate.x, operate.y, 0));
						console.log(`更新玩家 ${connectionInput.connectionId} 位置: (${operate.x}, ${operate.y})`);
					}
				});
			});
		}
	}
}
