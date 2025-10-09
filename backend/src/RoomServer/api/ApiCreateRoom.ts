import { ApiCall } from "tsrpc";
import { roomServer } from "../../roomServer";
import { ReqCreateRoom, ResCreateRoom } from "../../shared/protocols/matchServer/PtlCreateRoom";

export async function ApiCreateRoom(call: ApiCall<ReqCreateRoom, ResCreateRoom>) {
	let room = roomServer.createRoom(call.req.roomName);

	// 启动帧同步
	room.startFrameSync();

	call.succ({
		roomId: room.data.id,
		serverUrl: roomServer.options.thisServerUrl,
	});
}
