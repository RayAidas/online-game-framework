import { ApiCall } from "tsrpc";
import { ReqSetReady, ResSetReady } from "../../shared/protocols/roomServer/PtlSetReady";
import { RoomServerConn } from "../RoomServer";

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

		// 检查是否所有玩家都已准备就绪，如果是则启动帧同步
		if (call.req.isReady) {
			const allUsersReady = room.data.users.every((user) => user.isReady === true);
			if (allUsersReady && room.data.users.length >= room.data.maxUser) {
				// 至少需要2个玩家才能开始游戏
				console.log(`[ApiSetReady] 所有玩家已准备就绪，启动帧同步`);
				room.startFrameSync();

				// 设置游戏开始时间
				room.data.startMatchTime = Date.now();

				// 广播游戏开始消息
				room.broadcastMsg("serverMsg/GameStarted", {
					time: new Date(),
					message: "游戏开始！",
				});
			}
		}
	}

	call.succ({ needLogin: true });
}
