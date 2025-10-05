import { ApiCall } from "tsrpc";
import { ReqRegister, ResRegister } from "../../shared/protocols/userServer/PtlRegister";

export default async function (call: ApiCall<ReqRegister, ResRegister>) {
    // TODO
    call.error('API Not Implemented');
}