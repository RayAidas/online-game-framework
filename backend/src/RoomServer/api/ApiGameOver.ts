import { ApiCall } from "tsrpc";
import { RedisRoomStateService } from "../../services/RedisRoomStateService";
import { ReqGameOver, ResGameOver } from "../../shared/protocols/roomServer/PtlGameOver";
import { GamePhase } from "../../shared/types/GamePhase";
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
	// 对于卡牌游戏，只要有一个玩家出完手牌就结束游戏
	const shouldEndGame = room.overNum >= 1 && room.data.turnData;
	if (shouldEndGame) {
		// 广播游戏结束消息
		room.broadcastMsg("serverMsg/GameOver", {
			time: new Date(),
			message: `${currentUser.nickname} 获胜！`,
			playerId: currentUser.id,
		});
	} else if (room.overNum >= room.data.maxUser || room.overNum >= room.data.users.filter((user) => !user.isOffline).length) {
		room.data.gamePhase = GamePhase.FINISHED;
		room.overNum = 0;

		// 重置所有用户的准备状态
		room.data.users.forEach((user) => {
			user.isReady = false;
			user.gamePhase = GamePhase.FINISHED;
			RedisRoomStateService.updateUserGamePhase(parseInt(user.id), GamePhase.FINISHED);
		});
	}

	call.succ({});
}
