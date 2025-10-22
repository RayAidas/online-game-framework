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

	if(!currentUser) {
		return call.error("用户信息无效");
	}
 
	room.overNum++;
	if (room.overNum >= room.data.maxUser) {
		room.overNum = 0;
		room.broadcastMsg("serverMsg/GameOver", {
			time: new Date(),
			message: "游戏结束！",
			playerId: call.req.playerId,
		});
	}

	call.succ({});
}