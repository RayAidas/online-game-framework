import { ApiCall } from "tsrpc";
import { ReqLogout, ResLogout } from "../../shared/protocols/user/PtlLogout";

export default async function (call: ApiCall<ReqLogout, ResLogout>) {
    // TODO
    call.error('API Not Implemented');
}