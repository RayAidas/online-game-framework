import { ApiCall } from "tsrpc";
import { ReqCreateRoom, ResCreateRoom } from "../../../shared/protocols/matchServer/PtlCreateRoom";

export default async function (call: ApiCall<ReqCreateRoom, ResCreateRoom>) {
    // TODO
    call.error('API Not Implemented');
}