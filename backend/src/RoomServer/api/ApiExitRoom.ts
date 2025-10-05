import { ApiCall, HttpClient } from "tsrpc";
import { RoomStateService } from "../../services/RoomStateService";
import { ReqExitRoom, ResExitRoom } from "../../shared/protocols/roomServer/PtlExitRoom";
import { serviceProto as serviceProto_matchServer } from "../../shared/protocols/serviceProto_matchServer";
import { RoomServerConn } from "../RoomServer";

export async function ApiExitRoom(call: ApiCall<ReqExitRoom, ResExitRoom>) {
	const conn = call.conn as RoomServerConn;

	// 获取用户ID
	let userId: number | undefined;
	if (call.currentUser) {
		userId = call.currentUser.uid;
	} else if (conn.currentUser && conn.currentUser.id) {
		userId = parseInt(conn.currentUser.id);
		if (isNaN(userId)) {
			userId = undefined;
		}
	}

	// 清除房间服务器的用户房间状态
	if (userId) {
		RoomStateService.userLeaveRoom(userId);
	}

	// 通知匹配服务器清除用户房间状态
	if (userId) {
		try {
			const matchClient = new HttpClient(serviceProto_matchServer, {
				server: "http://127.0.0.1:3004",
				logger: console,
			});

			// 调用匹配服务器的清除状态API
			const result = await matchClient.callApi("ClearUserRoomState", {
				userId: userId,
			});

			if (!result.isSucc) {
				console.error(`[ApiExitRoom] 通知匹配服务器失败:`, result.err);
			}
		} catch (err) {
			console.error("[ApiExitRoom] 通知匹配服务器异常:", err);
		}
	}

	if (conn.currentRoom) {
		conn.currentRoom.leave(conn);
	}

	call.succ({});
}
