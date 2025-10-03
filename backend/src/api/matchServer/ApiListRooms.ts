import { ApiCall } from "tsrpc";
import { ReqListRooms, ResListRooms } from "../../shared/protocols/matchServer/PtlListRooms";

export default async function (call: ApiCall<ReqListRooms, ResListRooms>) {
    // TODO
    call.error('API Not Implemented');
}