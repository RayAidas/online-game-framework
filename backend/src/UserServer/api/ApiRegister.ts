import { ApiCall } from "tsrpc";
import { TokenService } from "../../services/TokenService";
import { UserService } from "../../services/UserService";
import { ReqRegister, ResRegister } from "../../shared/protocols/userServer/PtlRegister";
import { PasswordService } from "../../services/PasswordService";

export default async function (call: ApiCall<ReqRegister, ResRegister>) {
	const { username, password } = call.req;

	// 参数验证
	if (!username || !password) {
		return call.error("用户名和密码不能为空");
	}

	// 验证用户名长度
	if (username.length < 3 || username.length > 20) {
		return call.error("用户名长度必须在3-20个字符之间");
	}

	// 使用 PasswordService 进行密码策略验证（与注册逻辑保持一致）
	const passwordValidation = PasswordService.validatePasswordPolicy(password);
	if (!passwordValidation.isValid) {
		return call.error("密码不符合安全策略：" + passwordValidation.errors.join("；"));
	}

	try {
		// 检查用户名是否已存在
		const usernameExists = await UserService.isUsernameExists(username);
		if (usernameExists) {
			return call.error("用户名已存在");
		}

		// 创建新用户
		const newUser = await UserService.createUser(username, password, ["Normal"]);
		if (!newUser) {
			return call.error("用户注册失败，请稍后重试");
		}

		// 生成 SSO Token
		const ssoToken = await TokenService.createSsoToken(newUser.uid);

		// 设置当前用户信息
		call.currentUser = {
			uid: newUser.uid,
			username: newUser.username,
			roles: newUser.roles,
		};

		// 返回成功结果
		call.succ({
			__ssoToken: ssoToken,
			user: {
				uid: newUser.uid,
				username: newUser.username,
				roles: newUser.roles,
			},
		});
	} catch (error) {
		console.error("用户注册失败:", error);
		return call.error("用户注册失败，请稍后重试");
	}
}
