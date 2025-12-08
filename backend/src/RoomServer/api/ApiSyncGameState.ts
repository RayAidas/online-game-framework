import { ApiCall } from "tsrpc";
import { ReqSyncGameState, ResSyncGameState } from "../../shared/protocols/roomServer/PtlSyncGameState";
import { RoomServerConn } from "../RoomServer";

/**
 * 同步游戏状态
 * 客户端每次游戏状态变化时调用，将状态同步到服务端
 */
export async function ApiSyncGameState(call: ApiCall<ReqSyncGameState, ResSyncGameState>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!conn.currentUser) {
		return call.error("用户信息不存在");
	}

	// 保存游戏状态到房间数据
	// 如果 gameState 为 null 或 undefined，表示清除状态
	if (call.req.gameState === null || call.req.gameState === undefined) {
		room.data.gameState = undefined;
		console.log(`[SyncGameState] 房间 ${room.data.id} 游戏状态已清除`);
	} else {
		room.data.gameState = call.req.gameState;
		console.log(`[SyncGameState] 房间 ${room.data.id} 游戏状态已同步`);
	}

	call.succ({ success: true });
}
