import { ApiCallHttp } from "tsrpc";
import { matchServer } from "../../matchServer";
import { ReqStartMatch, ResStartMatch } from "../../shared/protocols/matchServer/PtlStartMatch";
import { RoomStateService } from "../../services/RoomStateService";

export async function ApiStartMatch(call: ApiCallHttp<ReqStartMatch, ResStartMatch>) {
	// 检查用户是否已经在房间中
	if (call.currentUser && RoomStateService.isUserInRoom(call.currentUser.uid)) {
		return call.error("您已经在房间中，请先退出当前房间再创建新房间", { code: "ALREADY_IN_ROOM" });
	}
	// 加入匹配队列，待匹配
	matchServer.matchQueue.add(call);
}
