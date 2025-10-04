import { v4 as uuidv4 } from "uuid";
import { redisClient, SSOTokenInfo } from "../models/Database";

const SSO_VALID_TIME = 86400000 * 7; // 7天

/**
 * Token 管理服务
 * 负责所有与 SSO Token 相关的操作
 */
export class TokenService {
	/**
	 * 创建 SSO Token
	 */
	static async createSsoToken(uid: number): Promise<string> {
		const token = uuidv4();
		const expiredTime = Date.now() + SSO_VALID_TIME;

		const tokenInfo: SSOTokenInfo = {
			uid: uid,
			expiredTime: expiredTime,
		};

		await redisClient.setEx(`sso:${token}`, Math.ceil(SSO_VALID_TIME / 1000), JSON.stringify(tokenInfo));

		return token;
	}

	/**
	 * 销毁 SSO Token
	 */
	static async destroySsoToken(ssoToken: string): Promise<void> {
		await redisClient.del(`sso:${ssoToken}`);
	}

	/**
	 * 清除用户的所有旧 token（单点登录）
	 */
	static async clearUserTokens(uid: number): Promise<void> {
		try {
			const keys = await redisClient.keys(`sso:*`);
			const tokensToDelete: string[] = [];

			for (const key of keys) {
				const tokenData = await redisClient.get(key);
				if (tokenData) {
					try {
						const tokenInfo: SSOTokenInfo = JSON.parse(tokenData);
						if (tokenInfo.uid === uid) {
							tokensToDelete.push(key);
						}
					} catch (error) {
						// 如果解析失败，也删除这个无效的 key
						tokensToDelete.push(key);
					}
				}
			}

			if (tokensToDelete.length > 0) {
				await redisClient.del(tokensToDelete);
				console.log(`已清除用户 ${uid} 的 ${tokensToDelete.length} 个旧 token`);
			}
		} catch (error) {
			console.error("清除用户 token 失败:", error);
		}
	}

	/**
	 * 获取用户当前有效的 token 数量
	 */
	static async getUserTokenCount(uid: number): Promise<number> {
		try {
			const keys = await redisClient.keys(`sso:*`);
			let count = 0;

			for (const key of keys) {
				const tokenData = await redisClient.get(key);
				if (tokenData) {
					try {
						const tokenInfo: SSOTokenInfo = JSON.parse(tokenData);
						if (tokenInfo.uid === uid && tokenInfo.expiredTime > Date.now()) {
							count++;
						}
					} catch (error) {
						// 忽略解析错误
					}
				}
			}

			return count;
		} catch (error) {
			console.error("获取用户 token 数量失败:", error);
			return 0;
		}
	}

	/**
	 * 清理所有过期的 token
	 */
	static async cleanupExpiredTokens(): Promise<number> {
		try {
			const keys = await redisClient.keys(`sso:*`);
			const tokensToDelete: string[] = [];
			const currentTime = Date.now();

			for (const key of keys) {
				const tokenData = await redisClient.get(key);
				if (tokenData) {
					try {
						const tokenInfo: SSOTokenInfo = JSON.parse(tokenData);
						if (tokenInfo.expiredTime < currentTime) {
							tokensToDelete.push(key);
						}
					} catch (error) {
						// 如果解析失败，也删除这个无效的 key
						tokensToDelete.push(key);
					}
				}
			}

			if (tokensToDelete.length > 0) {
				await redisClient.del(tokensToDelete);
				console.log(`已清理 ${tokensToDelete.length} 个过期 token`);
			}

			return tokensToDelete.length;
		} catch (error) {
			console.error("清理过期 token 失败:", error);
			return 0;
		}
	}

	/**
	 * 解析 SSO Token 并返回用户信息
	 */
	static async parseSSO(ssoToken: string): Promise<{ uid: number; username: string; roles: string[] } | null> {
		if (!ssoToken) {
			console.log("SSO Token 为空或未定义");
			return null;
		}

		const tokenData = await redisClient.get(`sso:${ssoToken}`);
		if (!tokenData) {
			console.log("Token 不存在于 Redis 中");
			return null;
		}

		let info: SSOTokenInfo;
		try {
			info = JSON.parse(tokenData);
		} catch (error) {
			console.log("Token 数据解析失败:", error);
			return null;
		}

		// 检查 Token 是否过期
		if (info.expiredTime < Date.now()) {
			console.log("Token 已过期，过期时间:", new Date(info.expiredTime).toISOString());
			await redisClient.del(`sso:${ssoToken}`);
			return null;
		}

		// 延长 Token 过期时间
		info.expiredTime = Date.now() + SSO_VALID_TIME;
		await redisClient.setEx(`sso:${ssoToken}`, Math.ceil(SSO_VALID_TIME / 1000), JSON.stringify(info));

		return {
			uid: info.uid,
			username: "", // 这里需要从数据库获取，但为了保持接口简洁，暂时返回空
			roles: [], // 这里需要从数据库获取，但为了保持接口简洁，暂时返回空
		};
	}
}
