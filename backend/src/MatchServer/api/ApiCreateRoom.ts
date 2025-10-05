import { ApiCall } from "tsrpc";
import { matchServer } from "../../matchServer";
import { RoomStateService } from "../../services/RoomStateService";
import { ReqCreateRoom, ResCreateRoom } from "../../shared/protocols/matchServer/PtlCreateRoom";

export async function ApiCreateRoom(call: ApiCall<ReqCreateRoom, ResCreateRoom>) {
	// 参数校验
	if (!call.req.roomName) {
		return call.error("请输入房间名称");
	}

	// 检查用户是否已经在房间中
	if (call.currentUser && RoomStateService.isUserInRoom(call.currentUser.uid)) {
		return call.error("您已经在房间中，请先退出当前房间再创建新房间", { code: "ALREADY_IN_ROOM" });
	}

	let ret = await matchServer.createRoom(call.req.roomName, call.currentUser?.uid);
	ret.isSucc ? call.succ(ret.res) : call.error(ret.err);
}
