import { ApiCall } from "tsrpc";
import { ReqEndTurn, ResEndTurn } from "../../shared/protocols/roomServer/PtlEndTurn";
import { RoomServerConn } from "../RoomServer";

/**
 * 结束回合制
 * 只有房主可以结束回合制
 */
export async function ApiEndTurn(call: ApiCall<ReqEndTurn, ResEndTurn>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!conn.currentUser) {
		return call.error("用户信息不存在");
	}

	// 检查是否是房主
	if (room.data.ownerId !== conn.currentUser.id) {
		return call.error("只有房主可以结束回合制");
	}

	// 结束回合制
	room.endTurnBased();

	call.succ({ success: true });
}
