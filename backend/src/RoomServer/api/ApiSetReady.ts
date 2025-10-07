import { ApiCall } from "tsrpc";
import { RoomServerConn } from "../RoomServer";
import { ReqSetReady, ResSetReady } from "../../shared/protocols/roomServer/PtlSetReady";

export default async function (call: ApiCall<ReqSetReady, ResSetReady>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	// 更新用户的准备状态
	const userIndex = room.data.users.findIndex((user) => user.id === currentUser.id);
	if (userIndex !== -1) {
		room.data.users[userIndex].isReady = call.req.isReady;
		room.data.updateTime = Date.now();

		// 广播准备状态变更消息
		room.broadcastMsg("serverMsg/UserReadyChanged", {
			time: new Date(),
			user: currentUser,
			isReady: call.req.isReady,
		});

		console.log(`[ApiSetReady] 用户 ${currentUser.id} 设置准备状态为: ${call.req.isReady}`);
	}

	call.succ({ needLogin: true });
}
