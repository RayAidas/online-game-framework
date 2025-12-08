import { ApiCall } from "tsrpc";
import { ReqGetGameState, ResGetGameState } from "../../shared/protocols/roomServer/PtlGetGameState";
import { RoomServerConn } from "../RoomServer";

/**
 * 获取游戏状态
 * 客户端重连时调用，用于恢复游戏状态
 */
export async function ApiGetGameState(call: ApiCall<ReqGetGameState, ResGetGameState>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	const hasState = room.data.gameState !== undefined && room.data.gameState !== null;

	console.log(`[GetGameState] 房间 ${room.data.id} 获取游戏状态, hasState: ${hasState}`);

	call.succ({
		gameState: room.data.gameState,
		hasState: hasState,
	});
}
