import { ApiCall } from "tsrpc";
import { ReqGameOver, ResGameOver } from "../../shared/protocols/roomServer/PtlGameOver";
import { RoomServerConn } from "../RoomServer";

export async function ApiGameOver(call: ApiCall<ReqGameOver, ResGameOver>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	room.overNum++;
	if (room.overNum >= room.data.maxUser) {
		room.overNum = 0;

		// 更新游戏阶段为已结束
		room.data.gamePhase = "FINISHED" as any;

		// 重置所有用户的准备状态
		room.data.users.forEach((user) => {
			user.isReady = false;
		});

		room.broadcastMsg("serverMsg/GameOver", {
			time: new Date(),
			message: "游戏结束！",
			playerId: call.req.playerId,
		});
	}

	call.succ({});
}
