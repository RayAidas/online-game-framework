import { ApiCallHttp, HttpServer, WsServer } from "tsrpc";
import { AuthService } from "../services/AuthService";
import { BaseConf, BaseRequest, BaseResponse } from "../shared/protocols/base";

export function parseCurrentUser(server: HttpServer | WsServer) {
	// Auto parse call.currentUser
	server.flows.preApiCallFlow.push(async (call: ApiCallHttp<BaseRequest, BaseResponse>) => {
		let req = call.req as BaseRequest;
		if (req.__ssoToken) {
			call.currentUser = await AuthService.parseSSO(req.__ssoToken);
		}

		// 获取协议配置
		let conf = call.service.conf;
		// 若协议配置为需要登录，则阻止未登录的请求
		if (conf?.needLogin && !call.currentUser) {
			call.error("您还未登录", { code: "NEED_LOGIN" });
			return undefined;
		}

		return call;
	});
}

export function enableAuthentication(server: HttpServer | WsServer) {
	server.flows.preApiCallFlow.push((call: ApiCallHttp<BaseRequest, BaseResponse>) => {
		let conf: BaseConf | undefined = call.service.conf;

		// NeedLogin
		if (conf?.needLogin && !call.currentUser) {
			call.error("You need login before do this", { code: "NEED_LOGIN" });
			return undefined;
		}

		// NeedRoles
		if (conf?.needRoles?.length && !call.currentUser?.roles.some((v) => conf!.needRoles!.indexOf(v) > -1)) {
			call.error("You do NOT have authority to do this", { code: "NO_AUTHORITY" });
			return undefined;
		}

		return call;
	});
}
