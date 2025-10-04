import { ApiCall } from "tsrpc";
import { AuthService } from "../../services/AuthService";
import { ReqLogin, ResLogin } from "../../shared/protocols/userServer/PtlLogin";

export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>) {
	// 如果提供了 SSO Token，尝试自动登录
	if (call.req.__ssoToken) {
		const result = await AuthService.loginWithToken(call.req.__ssoToken);

		if (result.success) {
			call.succ({
				__ssoToken: result.token!,
				user: result.user!,
			});
		} else {
			call.error(result.error!, { code: result.code! });
		}
		return;
	}

	// 如果提供了用户名和密码，进行手动登录
	if (call.req.username && call.req.password) {
		const result = await AuthService.loginWithCredentials(call.req.username, call.req.password);

		if (result.success) {
			call.succ({
				__ssoToken: result.token!,
				user: result.user!,
			});
		} else {
			call.error(result.error!, { code: result.code! });
		}
		return;
	}

	// 如果既没有 SSO Token 也没有用户名密码
	call.error("请提供 SSO Token 或用户名密码", { code: "MISSING_CREDENTIALS" });
}
