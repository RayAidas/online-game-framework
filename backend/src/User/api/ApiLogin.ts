import { ApiCall } from "tsrpc";
import { UserUtil } from "../../models/UserUtil";
import { ReqLogin, ResLogin } from "../../shared/protocols/userServer/PtlLogin";

export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>) {
	// 如果提供了 SSO Token，尝试自动登录
	if (call.req.__ssoToken) {
		console.log("尝试通过 SSO Token 自动登录...");
		console.log("SSO Token:", call.req.__ssoToken ? call.req.__ssoToken.substring(0, 10) + "..." : "无效");

		// 通过 SSO Token 解析用户信息
		const currentUser = await UserUtil.parseSSO(call.req.__ssoToken);
		if (!currentUser) {
			console.log("SSO Token 解析失败，可能已过期或不存在");
			call.error("SSO Token 无效或已过期", { code: "INVALID_TOKEN" });
			return;
		}

		// 找到用户信息
		const user = UserUtil.users.find((v) => v.uid === currentUser.uid);
		if (!user) {
			call.error("用户不存在", { code: "USER_NOT_FOUND" });
			return;
		}

		// 延长 SSO Token 有效期
		let sso = await UserUtil.createSsoToken(user.uid);

		call.succ({
			__ssoToken: sso,
			user: currentUser,
		});
		return;
	}

	// 如果提供了用户名和密码，进行手动登录
	if (call.req.username && call.req.password) {
		console.log("尝试通过用户名密码登录...");

		let user = UserUtil.users.find((v) => v.username === call.req.username && v.password === call.req.password);
		if (!user) {
			call.error("用户名或密码错误", { code: "INVALID_CREDENTIALS" });
			return;
		}

		let sso = await UserUtil.createSsoToken(user.uid);

		call.succ({
			__ssoToken: sso,
			user: user,
		});
		return;
	}

	// 如果既没有 SSO Token 也没有用户名密码
	call.error("请提供 SSO Token 或用户名密码", { code: "MISSING_CREDENTIALS" });
}
