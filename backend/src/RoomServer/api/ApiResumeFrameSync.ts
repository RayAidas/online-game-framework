import { ApiCall } from "tsrpc";
import { ReqResumeFrameSync, ResResumeFrameSync } from "../../shared/protocols/roomServer/PtlResumeFrameSync";
import { RoomServerConn } from "../RoomServer";

export async function ApiResumeFrameSync(call: ApiCall<ReqResumeFrameSync, ResResumeFrameSync>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	room.resumeFrameSync();

	call.succ({});
}
