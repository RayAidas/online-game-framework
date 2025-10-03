import { ApiCall } from "tsrpc";
import { ReqExitRoom, ResExitRoom } from "../../shared/protocols/roomServer/PtlExitRoom";

export default async function (call: ApiCall<ReqExitRoom, ResExitRoom>) {
    // TODO
    call.error('API Not Implemented');
}