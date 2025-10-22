import { ApiCall } from "tsrpc";
import { ReqRequestGameState, ResRequestGameState } from "../../shared/protocols/roomServer/PtlRequestGameState";
import { RoomServerConn } from "../RoomServer";

export async function ApiRequestGameState(call: ApiCall<ReqRequestGameState, ResRequestGameState>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	// 获取帧同步服务
	const frameSyncService = room.getFrameSyncService();
	if (!frameSyncService) {
		return call.error("房间未开启帧同步");
	}

	// 获取当前状态和追帧数据
	const stateData = frameSyncService.lastStateData;
	const stateFrameIndex = frameSyncService.lastStateDataFrameIndex;
	const currentFrameIndex = frameSyncService.getCurrentFrameIndex();

	// 获取状态之后的所有帧
	const afterFrames = frameSyncService.getAfterFrames(stateFrameIndex + 1);

	console.log(`[ApiRequestGameState] 用户 ${call.currentUser?.uid} 请求游戏状态`);
	console.log(`  状态帧索引: ${stateFrameIndex}`);
	console.log(`  当前帧索引: ${currentFrameIndex}`);
	console.log(`  追帧数量: ${afterFrames.length}`);

	call.succ({
		stateData: stateData,
		stateFrameIndex: stateFrameIndex,
		afterFrames: afterFrames,
		startFrameIndex: stateFrameIndex + 1,
		currentFrameIndex: currentFrameIndex,
	});
}
