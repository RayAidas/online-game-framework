import { _decorator, Component, EditBox } from "cc";
import { HttpClient, WsClient } from "tsrpc-browser";
import { getMatchClient } from "./getMatchClient";
import { getRoomClient } from "./getRoomClient";
import { CurrentUser } from "./shared/models/CurrentUser";
import { userManager } from "./shared/models/UserManager";
import { ServiceType as MatchServiceType } from "./shared/protocols/serviceProto_matchServer";
import { ServiceType as RoomServiceType } from "./shared/protocols/serviceProto_roomServer";
const { ccclass, property } = _decorator;

@ccclass("MatchTest")
export class MatchTest extends Component {
	@property(EditBox) roomId: EditBox = null!;

	matchClient: HttpClient<MatchServiceType>;
	roomClient: WsClient<RoomServiceType>;

	private currentUser: CurrentUser | null = null;

	protected onLoad(): void {
		this.matchClient = getMatchClient();
		this.roomClient = getRoomClient();

		// 监听用户状态变化
		userManager.onUserChange((user) => {
			this.currentUser = user;
		});

		// 初始化当前用户状态
		this.currentUser = userManager.currentUser;

		// 设置匹配服务器客户端的前置流程
		this.matchClient.flows.preCallApiFlow.push((v) => {
			// 获取协议配置
			let conf = this.matchClient.serviceMap.apiName2Service[v.apiName]!.conf;
			// 若协议配置为需要登录，则检查用户是否已登录
			if (conf?.needLogin) {
				if (!this.currentUser) {
					console.log("需要登录，当前用户:", this.currentUser);
					return;
				}
				console.log("用户已登录，允许调用API:", this.currentUser.username);
			}

			return v;
		});

		// 设置房间服务器客户端的前置流程
		this.roomClient.flows.preCallApiFlow.push((v) => {
			// 获取协议配置
			let conf = this.roomClient.serviceMap.apiName2Service[v.apiName]!.conf;
			// 若协议配置为需要登录，则检查用户是否已登录
			if (conf?.needLogin) {
				if (!this.currentUser) {
					console.log("需要登录，当前用户:", this.currentUser);
					return;
				}
				console.log("用户已登录，允许调用房间API:", this.currentUser.username);
			}

			return v;
		});
	}

	update(deltaTime: number) {}

	onCreateRoom() {
		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		this.matchClient
			.callApi("CreateRoom", {
				roomName: "TestRoom",
			})
			.then((ret) => {
				if (ret.isSucc) {
					console.log("创建房间成功:", ret.res);
					// 创建成功后可以自动加入房间
					this.joinRoomById(ret.res.roomId);
				} else {
					console.error("创建房间失败:", ret.err);
				}
			});
	}

	onJoinRoom() {
		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		const roomId = this.roomId.string;
		if (!roomId) {
			console.log("请输入房间ID");
			return;
		}

		this.joinRoomById(roomId);
	}

	// 通过房间ID加入房间
	private joinRoomById(roomId: string) {
		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		console.log("正在加入房间:", roomId);

		// 检查连接状态并尝试连接
		this.ensureConnection()
			.then(() => {
				this.callJoinRoom(roomId);
			})
			.catch((err) => {
				console.error("无法建立连接:", err);
			});
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

	// 实际调用加入房间 API
	private callJoinRoom(roomId: string) {
		this.roomClient
			.callApi("JoinRoom", {
				roomId: roomId,
				nickname: this.currentUser!.username,
			})
			.then((ret) => {
				if (ret.isSucc) {
					console.log("加入房间成功:", ret.res);
					console.log("房间数据:", ret.res.roomData);
					console.log("当前用户:", ret.res.currentUser);
				} else {
					console.error("加入房间失败:", ret.err);
					this.handleApiError("加入房间", ret.err);
				}
			})
			.catch((err) => {
				console.error("加入房间 API 调用异常:", err);
				this.handleApiError("加入房间", err);
			});
	}

	// 退出房间
	onExitRoom() {
		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		// 检查连接状态并尝试连接
		this.ensureConnection()
			.then(() => {
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
				} else {
					console.error("退出房间失败:", ret.err);
					this.handleApiError("退出房间", ret.err);
				}
			})
			.catch((err) => {
				console.error("退出房间 API 调用异常:", err);
				this.handleApiError("退出房间", err);
			});
	}

	// 统一的错误处理方法
	private handleApiError(operation: string, error: any) {
		let errorMessage = `${operation}操作失败: `;

		if (error && error.message) {
			errorMessage += error.message;
		} else if (error && typeof error === "string") {
			errorMessage += error;
		} else {
			errorMessage += "未知错误";
		}

		// 根据错误类型提供不同的处理建议
		if (error && error.code === "LOST_CONN") {
			errorMessage += "\n建议：请检查网络连接或重新尝试";
		} else if (error && error.code === "ROOM_NOT_EXISTS") {
			errorMessage += "\n建议：请检查房间ID是否正确";
		} else if (error && error.code === "ALREADY_IN_ROOM") {
			errorMessage += "\n建议：请先退出当前房间";
		}

		console.error(errorMessage);
		// 这里可以添加UI提示，比如显示错误对话框
	}

	onLogout() {
		userManager.logout();
		console.log("用户已登出");
	}
}
