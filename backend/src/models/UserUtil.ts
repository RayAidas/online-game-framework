import { v4 as uuidv4 } from "uuid";
import { CurrentUser } from "../shared/models/CurrentUser";
import { mysqlPool, redisClient, SSOTokenInfo, User } from "./Database";

const SSO_VALID_TIME = 86400000 * 7;

export class UserUtil {
	// 初始化数据库连接
	static async init() {
		try {
			await redisClient.connect();
			// MySQL 连接池在创建时就已经建立连接，无需手动连接
			console.log("UserUtil 初始化完成");
		} catch (error) {
			console.error("UserUtil 初始化失败:", error);
			throw error;
		}
	}

	static async createSsoToken(uid: number): Promise<string> {
		let token = uuidv4();
		// Expired after some time without any action
		let expiredTime = Date.now() + SSO_VALID_TIME;

		// 将 SSO Token 信息存储到 Redis
		const tokenInfo: SSOTokenInfo = {
			uid: uid,
			expiredTime: expiredTime,
		};

		await redisClient.setEx(`sso:${token}`, Math.ceil(SSO_VALID_TIME / 1000), JSON.stringify(tokenInfo));

		return token;
	}

	static async destroySsoToken(ssoToken: string): Promise<void> {
		await redisClient.del(`sso:${ssoToken}`);
	}

	// 清除用户的所有旧 token
	static async clearUserTokens(uid: number): Promise<void> {
		try {
			// 获取该用户的所有 token
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

			// 删除所有该用户的 token
			if (tokensToDelete.length > 0) {
				await redisClient.del(tokensToDelete);
				console.log(`已清除用户 ${uid} 的 ${tokensToDelete.length} 个旧 token`);
			}
		} catch (error) {
			console.error("清除用户 token 失败:", error);
		}
	}

	// 获取用户当前有效的 token 数量
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

	// 清理所有过期的 token
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

			// 删除所有过期的 token
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

	static async parseSSO(ssoToken: string): Promise<CurrentUser | undefined> {
		// 检查 ssoToken 是否有效
		if (!ssoToken) {
			console.log("SSO Token 为空或未定义");
			return undefined;
		}

		// 从 Redis 获取 Token 信息
		const tokenData = await redisClient.get(`sso:${ssoToken}`);
		if (!tokenData) {
			console.log("Token 不存在于 Redis 中");
			return undefined;
		}

		let info: SSOTokenInfo;
		try {
			info = JSON.parse(tokenData);
		} catch (error) {
			console.log("Token 数据解析失败:", error);
			return undefined;
		}

		console.log("解析 SSO Token:", ssoToken.substring(0, 10) + "...");
		console.log("Token 信息:", info);
		console.log("当前时间:", new Date().toISOString());

		// 检查 Token 是否过期
		if (info.expiredTime < Date.now()) {
			console.log("Token 已过期，过期时间:", new Date(info.expiredTime).toISOString());
			// 删除过期的 Token
			await redisClient.del(`sso:${ssoToken}`);
			return undefined;
		}

		// 从 MySQL 数据库获取用户信息
		const [rows] = await mysqlPool.execute("SELECT uid, username, roles FROM users WHERE uid = ?", [info.uid]);

		const users = rows as User[];
		if (users.length === 0) {
			console.log("用户不存在");
			return undefined;
		}

		const user = users[0];

		// 延长 Token 过期时间
		info.expiredTime = Date.now() + SSO_VALID_TIME;
		await redisClient.setEx(`sso:${ssoToken}`, Math.ceil(SSO_VALID_TIME / 1000), JSON.stringify(info));

		// 返回解析的 CurrentUser
		return {
			uid: user.uid,
			username: user.username,
			roles: user.roles,
		};
	}

	// 根据用户名和密码验证用户
	static async validateUser(username: string, password: string): Promise<User | null> {
		try {
			console.log(`验证用户: ${username}`);
			const [rows] = await mysqlPool.execute("SELECT uid, username, password, roles FROM users WHERE username = ? AND password = ?", [
				username,
				password,
			]);

			const users = rows as User[];
			console.log(`查询结果: ${users.length} 个用户`);
			return users.length > 0 ? users[0] : null;
		} catch (error) {
			console.error("验证用户失败:", error);
			return null;
		}
	}

	// 根据用户ID获取用户信息
	static async getUserById(uid: number): Promise<User | null> {
		try {
			const [rows] = await mysqlPool.execute("SELECT uid, username, password, roles FROM users WHERE uid = ?", [uid]);

			const users = rows as User[];
			return users.length > 0 ? users[0] : null;
		} catch (error) {
			console.error("获取用户信息失败:", error);
			return null;
		}
	}

	// 创建新用户
	static async createUser(username: string, password: string, roles: string[] = ["Normal"]): Promise<User | null> {
		try {
			const [result] = await mysqlPool.execute("INSERT INTO users (username, password, roles) VALUES (?, ?, ?)", [
				username,
				password,
				JSON.stringify(roles),
			]);

			const insertResult = result as any;
			const newUser: User = {
				uid: insertResult.insertId,
				username,
				password,
				roles,
			};

			return newUser;
		} catch (error) {
			console.error("创建用户失败:", error);
			return null;
		}
	}

	// 更新用户信息
	static async updateUser(uid: number, updates: Partial<Pick<User, "username" | "password" | "roles">>): Promise<boolean> {
		try {
			const updateFields: string[] = [];
			const values: any[] = [];

			if (updates.username) {
				updateFields.push("username = ?");
				values.push(updates.username);
			}
			if (updates.password) {
				updateFields.push("password = ?");
				values.push(updates.password);
			}
			if (updates.roles) {
				updateFields.push("roles = ?");
				values.push(JSON.stringify(updates.roles));
			}

			if (updateFields.length === 0) {
				return false;
			}

			values.push(uid);
			const query = `UPDATE users SET ${updateFields.join(", ")} WHERE uid = ?`;

			const [result] = await mysqlPool.execute(query, values);
			const updateResult = result as any;

			return updateResult.affectedRows > 0;
		} catch (error) {
			console.error("更新用户失败:", error);
			return false;
		}
	}

	// 删除用户
	static async deleteUser(uid: number): Promise<boolean> {
		try {
			const [result] = await mysqlPool.execute("DELETE FROM users WHERE uid = ?", [uid]);

			const deleteResult = result as any;
			return deleteResult.affectedRows > 0;
		} catch (error) {
			console.error("删除用户失败:", error);
			return false;
		}
	}

	// 获取所有用户
	static async getAllUsers(): Promise<User[]> {
		try {
			const [rows] = await mysqlPool.execute("SELECT uid, username, password, roles FROM users ORDER BY uid");

			return rows as User[];
		} catch (error) {
			console.error("获取所有用户失败:", error);
			return [];
		}
	}

	// 关闭数据库连接
	static async close() {
		try {
			await redisClient.quit();
			await mysqlPool.end();
			console.log("数据库连接已关闭");
		} catch (error) {
			console.error("关闭数据库连接失败:", error);
		}
	}
}
