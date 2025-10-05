import { ApiCall } from "tsrpc";
import { ReqAuth, ResAuth } from "../../shared/protocols/roomServer/PtlAuth";

export default async function (call: ApiCall<ReqAuth, ResAuth>) {
    // TODO
    call.error('API Not Implemented');
}