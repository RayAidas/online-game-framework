import { ApiCall } from "tsrpc";
import { RoomStateService } from "../../services/RoomStateService";
import { ReqClearUserRoomState, ResClearUserRoomState } from "../../shared/protocols/matchServer/PtlClearUserRoomState";

export async function ApiClearUserRoomState(call: ApiCall<ReqClearUserRoomState, ResClearUserRoomState>) {
	const { userId } = call.req;

	if (!userId) {
		return call.error("用户ID不能为空");
	}

	// 清除用户房间状态
	RoomStateService.userLeaveRoom(userId);

	call.succ({});
}
