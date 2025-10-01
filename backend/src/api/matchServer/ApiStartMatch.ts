import { ApiCall } from "tsrpc";
import { ReqStartMatch, ResStartMatch } from "../../shared/protocols/matchServer/PtlStartMatch";

export default async function (call: ApiCall<ReqStartMatch, ResStartMatch>) {
    // TODO
    call.error('API Not Implemented');
}