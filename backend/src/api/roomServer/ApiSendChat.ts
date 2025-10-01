import { ApiCall } from "tsrpc";
import { ReqSendChat, ResSendChat } from "../../shared/protocols/roomServer/PtlSendChat";

export default async function (call: ApiCall<ReqSendChat, ResSendChat>) {
    // TODO
    call.error('API Not Implemented');
}