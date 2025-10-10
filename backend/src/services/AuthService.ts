import { CurrentUser } from "../shared/models/CurrentUser";
import { TokenService } from "./TokenService";
import { UserService } from "./UserService";

/**
 * 认证服务
 * 负责处理用户认证相关的业务逻辑
 */
export class AuthService {
	/**
	 * 通过用户名和密码进行登录
	 */
	static async loginWithCredentials(
		username: string,
		password: string
	): Promise<{
		success: boolean;
		token?: string;
		user?: CurrentUser;
		error?: string;
		code?: string;
	}> {
		try {
			// 验证用户凭据
			const user = await UserService.validateUser(username, password);
			if (!user) {
				return {
					success: false,
					error: "用户名或密码错误",
					code: "INVALID_CREDENTIALS",
				};
			}

			// 清除该用户的所有旧 token（单点登录）
			await TokenService.clearUserTokens(user.uid);

			// 创建新的 token
			const token = await TokenService.createSsoToken(user.uid);

			// 记录 token 数量（用于监控）
			const tokenCount = await TokenService.getUserTokenCount(user.uid);
			console.log(`用户 ${user.username} 登录成功，当前有效 token 数量: ${tokenCount}`);

			return {
				success: true,
				token,
				user: {
					uid: user.uid,
					username: user.username,
					roles: user.roles,
				},
			};
		} catch (error) {
			console.error("登录失败:", error);
			return {
				success: false,
				error: "登录过程中发生错误",
				code: "LOGIN_ERROR",
			};
		}
	}

	/**
	 * 通过 SSO Token 进行自动登录
	 */
	static async loginWithToken(ssoToken: string): Promise<{
		success: boolean;
		token?: string;
		user?: CurrentUser;
		error?: string;
		code?: string;
	}> {
		try {
			console.log("尝试通过 SSO Token 自动登录...");
			console.log("SSO Token:", ssoToken ? ssoToken.substring(0, 10) + "..." : "无效");

			// 解析 SSO Token
			const tokenInfo = await TokenService.parseSSO(ssoToken);
			if (!tokenInfo) {
				return {
					success: false,
					error: "SSO Token 无效或已过期",
					code: "INVALID_TOKEN",
				};
			}

			// 从数据库获取用户信息
			const user = await UserService.getUserById(tokenInfo.uid);
			if (!user) {
				return {
					success: false,
					error: "用户不存在",
					code: "USER_NOT_FOUND",
				};
			}

			// 清除该用户的所有旧 token（单点登录）
			await TokenService.clearUserTokens(user.uid);

			// 延长 SSO Token 有效期
			const newToken = await TokenService.createSsoToken(user.uid);

			return {
				success: true,
				token: newToken,
				user: {
					uid: user.uid,
					username: user.username,
					roles: user.roles,
				},
			};
		} catch (error) {
			console.error("Token 登录失败:", error);
			return {
				success: false,
				error: "Token 登录过程中发生错误",
				code: "TOKEN_LOGIN_ERROR",
			};
		}
	}

	/**
	 * 登出用户
	 */
	static async logout(ssoToken: string): Promise<{
		success: boolean;
		error?: string;
		code?: string;
	}> {
		try {
			await TokenService.destroySsoToken(ssoToken);
			return {
				success: true,
			};
		} catch (error) {
			console.error("登出失败:", error);
			return {
				success: false,
				error: "登出过程中发生错误",
				code: "LOGOUT_ERROR",
			};
		}
	}

	/**
	 * 验证用户权限
	 */
	static async validateUserPermission(user: CurrentUser, requiredRoles: string[]): Promise<boolean> {
		if (!user || !user.roles) {
			return false;
		}

		return requiredRoles.some((role) => user.roles.includes(role));
	}

	/**
	 * 解析 SSO Token 并返回用户信息
	 * 用于中间件自动解析用户身份
	 */
	static async parseSSO(ssoToken: string): Promise<CurrentUser | undefined> {
		if (!ssoToken) {
			console.log("SSO Token 为空或未定义");
			return undefined;
		}

		try {
			// 解析 SSO Token
			const tokenInfo = await TokenService.parseSSO(ssoToken);
			if (!tokenInfo) {
				console.log("Token 不存在或已过期");
				return undefined;
			}

			// 从数据库获取用户信息
			const user = await UserService.getUserById(tokenInfo.uid);
			if (!user) {
				console.log("用户不存在");
				return undefined;
			}

			// 返回 CurrentUser 格式的用户信息
			return {
				uid: user.uid,
				username: user.username,
				roles: user.roles,
			};
		} catch (error) {
			console.error("解析 SSO Token 失败:", error);
			return undefined;
		}
	}
}
