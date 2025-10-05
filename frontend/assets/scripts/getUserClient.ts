import { HttpClient } from "tsrpc-browser";
import { userManager } from "./shared/models/UserManager";
import { BaseResponse } from "./shared/protocols/base";
import { serviceProto } from "./shared/protocols/serviceProto_userServer";
import { ResLogin } from "./shared/protocols/userServer/PtlLogin";

// Create Client
const client = new HttpClient(serviceProto, {
	server: "http://127.0.0.1:3003",
	logger: console,
});

// When server return a SSOToken, store it to localStorage and sync user info
client.flows.postApiReturnFlow.push((v) => {
	if (v.return.isSucc) {
		let res = v.return.res;
		if (res.__ssoToken !== undefined) {
			localStorage.setItem("SSO_TOKEN", res.__ssoToken);
			userManager.ssoToken = res.__ssoToken;

			// 如果是登录或注册响应，同步用户信息到全局状态
			if (v.apiName === "Login" || v.apiName === "Register") {
				const loginRes = res as ResLogin;
				userManager.currentUser = loginRes.user;
				console.log("用户登录/注册成功:", loginRes.user);
			}
		}
	} else if (v.return.err.code === "NEED_LOGIN" || v.return.err.code === "INVALID_TOKEN") {
		userManager.logout();
		console.log("需要重新登录:", v.return.err.message);
	}
	return v;
});

// Append "__ssoToken" to request automatically
// client.flows.preCallApiFlow.push((v) => {
// 	let ssoToken = localStorage.getItem("SSO_TOKEN");
// 	if (ssoToken) {
// 		v.req.__ssoToken = ssoToken;
// 	}
// 	return v;
// });

export function getUserClient() {
	return client;
}
