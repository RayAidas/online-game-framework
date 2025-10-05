import { ApiCallHttp, HttpServer, WsServer } from "tsrpc";
import { AuthService } from "../services/AuthService";
import { BaseConf, BaseRequest, BaseResponse } from "../shared/protocols/base";

export async function parseCurrentUser(server: HttpServer | WsServer) {
	// Auto parse call.currentUser
	await server.flows.preApiCallFlow.push(async (call: ApiCallHttp<BaseRequest, BaseResponse>) => {
		let req = call.req;
		if (req.__ssoToken) {
			call.currentUser = await AuthService.parseSSO(req.__ssoToken);
		}
		return call;
	});
}

export async function enableAuthentication(server: HttpServer | WsServer) {
	await server.flows.preApiCallFlow.push((call: ApiCallHttp<BaseRequest, BaseResponse>) => {
		let conf: BaseConf | undefined = call.service.conf;

		// NeedLogin
		if (conf?.needLogin && !call.currentUser) {
			call.error("You need login before do this", { code: "NEED_LOGIN" });
			return undefined;
		}

		// if (conf?.needLogin && call.currentUser) {
		// 	console.log(`[enableAuthentication] API ${call.service.name} 认证通过，用户: ${call.currentUser.username}`);
		// }

		// NeedRoles
		if (conf?.needRoles?.length && !call.currentUser?.roles.some((v) => conf!.needRoles!.indexOf(v) > -1)) {
			call.error("You do NOT have authority to do this", { code: "NO_AUTHORITY" });
			return undefined;
		}

		return call;
	});
}
