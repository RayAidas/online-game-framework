import { ApiCall } from "tsrpc";
import { ReqJoinRoom, ResJoinRoom } from "../../shared/protocols/roomServer/PtlJoinRoom";

export default async function (call: ApiCall<ReqJoinRoom, ResJoinRoom>) {
    // TODO
    call.error('API Not Implemented');
}