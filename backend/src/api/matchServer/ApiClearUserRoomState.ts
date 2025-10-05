import { ApiCall } from "tsrpc";
import { ReqClearUserRoomState, ResClearUserRoomState } from "../../shared/protocols/matchServer/PtlClearUserRoomState";

export default async function (call: ApiCall<ReqClearUserRoomState, ResClearUserRoomState>) {
    // TODO
    call.error('API Not Implemented');
}