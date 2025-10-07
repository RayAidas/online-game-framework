import { ApiCall } from "tsrpc";
import { ReqSetReady, ResSetReady } from "../../shared/protocols/roomServer/PtlSetReady";

export default async function (call: ApiCall<ReqSetReady, ResSetReady>) {
	// TODO
	call.error("API Not Implemented");
}
