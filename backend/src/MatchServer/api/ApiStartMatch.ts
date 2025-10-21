import { ApiCallHttp } from "tsrpc";
import { matchServer } from "../../matchServer";
import { ReqStartMatch, ResStartMatch } from "../../shared/protocols/matchServer/PtlStartMatch";
import { RoomStateService } from "../../services/RoomStateService";

export async function ApiStartMatch(call: ApiCallHttp<ReqStartMatch, ResStartMatch>) {
	// 检查用户是否已经在房间中
	if (call.currentUser && RoomStateService.isUserInRoom(call.currentUser.uid)) {
		const roomId = RoomStateService.getUserRoomId(call.currentUser.uid);
		console.log(`用户 ${call.currentUser.uid} 尝试创建房间，但已在房间 ${roomId} 中`);

		// 检查房间是否真实存在
		const roomExists = matchServer.roomServers.some((rs) => rs.state && rs.state.rooms.some((room) => room.id === roomId));

		if (!roomExists) {
			console.log(`房间 ${roomId} 不存在，强制清理用户状态`);
			RoomStateService.forceClearUserState(call.currentUser.uid);
		} else {
			return call.error("您已经在房间中，请先退出当前房间再创建新房间", { code: "ALREADY_IN_ROOM" });
		}
	}
	
	// 加入匹配队列，待匹配
	matchServer.matchQueue.add(call);
}
