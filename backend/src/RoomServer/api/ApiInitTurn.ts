import { ApiCall } from "tsrpc";
import { ReqInitTurn, ResInitTurn } from "../../shared/protocols/roomServer/PtlInitTurn";
import { RoomServerConn } from "../RoomServer";

/**
 * 初始化回合制
 * 只有房主可以初始化回合制
 */
export async function ApiInitTurn(call: ApiCall<ReqInitTurn, ResInitTurn>) {
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
		return call.error("只有房主可以初始化回合制");
	}

	const firstPlayerSeatIndex = call.req.firstPlayerSeatIndex ?? 0;
	const turnTimeout = call.req.turnTimeout ?? 0;

	// 初始化回合制
	room.initTurnBased(firstPlayerSeatIndex, turnTimeout);

	call.succ({ success: true });

	// 广播回合开始消息
	const currentPlayer = room.data.users.find((u) => u.seatIndex === firstPlayerSeatIndex);
	room.broadcastMsg("serverMsg/TurnChanged", {
		turnData: room.data.turnData!,
		currentPlayer: currentPlayer,
	});
}
