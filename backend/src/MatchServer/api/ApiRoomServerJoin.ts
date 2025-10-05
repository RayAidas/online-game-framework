import { ApiCall } from "tsrpc";
import { matchServer } from "../../matchServer";
import { BackConfig } from "../../models/BackConfig";
import { ReqRoomServerJoin, ResRoomServerJoin } from "../../shared/protocols/matchServer/PtlRoomServerJoin";

export async function ApiRoomServerJoin(call: ApiCall<ReqRoomServerJoin, ResRoomServerJoin>) {
	// 鉴权
	if (call.req.token !== BackConfig.matchConnectToken) {
		return call.error("非法操作");
	}

	await matchServer.joinRoomServer(call.req.serverUrl);
	call.succ({});
}
