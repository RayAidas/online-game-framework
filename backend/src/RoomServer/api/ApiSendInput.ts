import { ApiCall } from "tsrpc";
import { ReqSendInput, ResSendInput } from "../../shared/protocols/roomServer/PtlSendInput";
import { RoomServerConn } from "../RoomServer";

export async function ApiSendInput(call: ApiCall<ReqSendInput, ResSendInput>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	// 获取房间的帧同步服务
	const frameSyncService = room.getFrameSyncService();
	if (!frameSyncService) {
		return call.error("房间帧同步服务未启动");
	}

	// 添加输入到帧同步服务
	frameSyncService.addConnectionInpFrame(currentUser.id, {
		operates: call.req.operates,
	});

	call.succ({});
}
