import { ApiCall } from "tsrpc";
import { ReqExitGame, ResExitGame } from "../../shared/protocols/roomServer/PtlExitGame";
import { RoomServerConn } from "../RoomServer";

export async function ApiExitGame(call: ApiCall<ReqExitGame, ResExitGame>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	room.finishNum++;
	if (room.finishNum >= room.data.maxUser) {
		room.finishNum = 0;
		room.data.gamePhase = "WAITING" as any;
	}

	call.succ({});

}