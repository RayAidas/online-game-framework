import { ApiCall } from "tsrpc";
import { RedisRoomStateService } from "../../services/RedisRoomStateService";
import { ReqExitRoom, ResExitRoom } from "../../shared/protocols/roomServer/PtlExitRoom";
import { ColorGenerator } from "../../utils/ColorGenerator";
import { RoomServerConn } from "../RoomServer";

export async function ApiExitRoom(call: ApiCall<ReqExitRoom, ResExitRoom>) {
	const conn = call.conn as RoomServerConn;

	// 获取用户ID
	let userId: number | undefined;
	if (call.currentUser) {
		userId = call.currentUser.uid;
	} else if (conn.currentUser && conn.currentUser.id) {
		userId = parseInt(conn.currentUser.id);
		if (isNaN(userId)) {
			userId = undefined;
		}
	}

	// 清除用户房间状态（Redis + 内存 + 通知 MatchServer）
	if (userId) {
		// RedisRoomStateService.userLeaveRoom() 会自动：
		// 1. 清除 Redis 中的数据
		// 2. 清除当前进程内存中的 RoomStateService 状态
		// 3. 通知 MatchServer 清除其进程中的状态
		await RedisRoomStateService.userLeaveRoom(userId);
	}

	if (conn.currentRoom) {
		// 在用户离开前，释放其颜色
		if (conn.currentUser) {
			const user = conn.currentRoom.data.users.find((u) => u.id === conn.currentUser!.id);
			if (user && user.color) {
				ColorGenerator.releaseColor(user.color);
				console.log(`释放用户 ${conn.currentUser.nickname} 的颜色: RGB(${user.color.r}, ${user.color.g}, ${user.color.b})`);
			}
		}

		conn.currentRoom.leave(conn);
	}

	call.succ({});
}
