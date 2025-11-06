import { ApiCall } from "tsrpc";
import { ReqNextTurn, ResNextTurn } from "../../shared/protocols/roomServer/PtlNextTurn";
import { RoomServerConn } from "../RoomServer";

/**
 * 切换到下一个玩家的回合
 * 只有当前回合的玩家可以结束自己的回合
 */
export async function ApiNextTurn(call: ApiCall<ReqNextTurn, ResNextTurn>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!conn.currentUser) {
		return call.error("用户信息不存在");
	}

	// 检查是否是当前回合玩家
	if (!room.isPlayerTurn(conn.currentUser.id)) {
		return call.error("不是您的回合");
	}

	// 切换到下一个玩家
	room.nextTurn(call.req.data ?? {});

	call.succ({ success: true });
}
