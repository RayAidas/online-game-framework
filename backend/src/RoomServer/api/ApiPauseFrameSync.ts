import { ApiCall } from "tsrpc";
import { ReqPauseFrameSync, ResPauseFrameSync } from "../../shared/protocols/roomServer/PtlPauseFrameSync";
import { RoomServerConn } from "../RoomServer";

export async function ApiPauseFrameSync(call: ApiCall<ReqPauseFrameSync, ResPauseFrameSync>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	room.pauseFrameSync();

	call.succ({});
}
