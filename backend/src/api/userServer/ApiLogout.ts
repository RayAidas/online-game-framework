import { ApiCall } from "tsrpc";
import { ReqLogout, ResLogout } from "../../shared/protocols/userServer/PtlLogout";

export default async function (call: ApiCall<ReqLogout, ResLogout>) {
    // TODO
    call.error('API Not Implemented');
}