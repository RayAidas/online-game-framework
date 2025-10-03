import { ApiCall } from "tsrpc";
import { ReqRoomServerJoin, ResRoomServerJoin } from "../../../shared/protocols/matchServer/admin/PtlRoomServerJoin";

export default async function (call: ApiCall<ReqRoomServerJoin, ResRoomServerJoin>) {
    // TODO
    call.error('API Not Implemented');
}