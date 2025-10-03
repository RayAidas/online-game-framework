import { ApiCall } from "tsrpc";
import { ReqLogin, ResLogin } from "../../shared/protocols/user/PtlLogin";

export default async function (call: ApiCall<ReqLogin, ResLogin>) {
    // TODO
    call.error('API Not Implemented');
}