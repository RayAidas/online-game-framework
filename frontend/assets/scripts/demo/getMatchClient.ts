import { userManager } from "db://assets/scripts/shared/models/UserManager";
import { serviceProto } from "db://assets/scripts/shared/protocols/serviceProto_matchServer";
import { HttpClient } from "../env";

export const getMatchClient = function () {
	const client = new HttpClient(serviceProto, {
		server: "http://127.0.0.1:3004",
		logger: console,
	});

	client.flows.preCallApiFlow.push((v) => {
		// 获取协议配置
		let conf = client.serviceMap.apiName2Service[v.apiName]!.conf;

		// 自动添加 SSO Token 到请求中（对需要登录的 API）
		if (conf?.needLogin && userManager.ssoToken) {
			(v.req as any).__ssoToken = userManager.ssoToken;
		}

		// 若协议配置为需要登录，则检查用户是否已登录
		if (conf?.needLogin) {
			if (!userManager.currentUser) {
				console.log("[getMatchClient] 需要登录，当前用户:", userManager.currentUser);
				return;
			}
		}

		return v;
	});

	return client;
};
