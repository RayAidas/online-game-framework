import { HttpClient } from "tsrpc-browser";
import { userManager } from "./shared/models/UserManager";
import { serviceProto } from "./shared/protocols/serviceProto_matchServer";

export const getMatchClient = function () {
	const client = new HttpClient(serviceProto, {
		server: "http://127.0.0.1:3004",
		logger: console,
	});

	// 自动添加 SSO Token 到请求中
	client.flows.preCallApiFlow.push((v) => {
		const ssoToken = localStorage.getItem("SSO_TOKEN");
		if (ssoToken) {
			(v.req as any).__ssoToken = ssoToken;
		}
		return v;
	});

	// 处理需要登录的错误
	client.flows.postApiReturnFlow.push((v) => {
		if (!v.return.isSucc && v.return.err.code === "NEED_LOGIN") {
			userManager.logout();
			console.log("需要重新登录");
		}
		return v;
	});

	return client;
};
