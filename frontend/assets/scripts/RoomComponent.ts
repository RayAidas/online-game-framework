import { _decorator, Component, EditBox } from "cc";
import { HttpClient, WsClient } from "tsrpc-browser";
import { getClient } from "./getClient";
import { getMatchClient } from "./getMatchClient";
import { ServiceType } from "./shared/protocols/serviceProto";
import { ServiceType as MatchServiceType } from "./shared/protocols/serviceProto_matchServer";
const { ccclass, property } = _decorator;

@ccclass("RoomComponent")
export class RoomComponent extends Component {
	@property(EditBox) inputRoomName: EditBox = null!;

	public client: WsClient<ServiceType>;
	public matchClient: HttpClient<MatchServiceType>;

	protected onLoad(): void {
		this.client = getClient();
		this.matchClient = getMatchClient();

		// Connect to RoomServer at startup
		this.client.connect().then((v) => {
			if (!v.isSucc) {
				console.log("= RoomServer Connect Error =\n" + v.errMsg);
			}
		});

		// HttpClient 不需要连接，直接可以使用
	}

	start() {}

	createRoom() {
		// 获取房间名称
		const roomName = this.inputRoomName.string;

		// 验证房间名称
		if (!roomName || roomName.trim() === "") {
			console.log("请输入房间名称");
			return;
		}

		// 调用创建房间API (使用 MatchServer 客户端)
		this.matchClient
			.callApi("CreateRoom", {
				roomName: roomName.trim(),
			})
			.then((ret) => {
				if (ret.isSucc) {
					console.log(`房间创建成功！\n房间ID: ${ret.res.roomId}\n服务器地址: ${ret.res.serverUrl}`);
					// 清空输入框
					this.inputRoomName.string = "";
				} else {
					console.log("创建房间失败: " + ret.err.message);
				}
			})
			.catch((err) => {
				console.log("创建房间时发生错误: " + err.message);
			});
	}

	update(deltaTime: number) {}
}
