import { mysqlPool, User } from "../models/Database";
import { PasswordService } from "./PasswordService";

/**
 * 用户数据服务
 * 负责所有与用户数据相关的数据库操作
 */
export class UserService {
	/**
	 * 根据用户名和密码验证用户
	 */
	static async validateUser(username: string, password: string): Promise<User | null> {
		try {
			console.log(`验证用户: ${username}`);
			// 先根据用户名查找用户
			const [rows] = await mysqlPool.execute("SELECT uid, username, password, roles FROM users WHERE username = ?", [username]);

			const users = rows as User[];
			console.log(`查询结果: ${users.length} 个用户`);

			if (users.length === 0) {
				return null;
			}

			const user = users[0];
			// 使用 bcrypt 验证密码
			const isPasswordValid = await PasswordService.verifyPassword(password, user.password);

			if (!isPasswordValid) {
				console.log(`用户 ${username} 密码验证失败`);
				return null;
			}

			console.log(`用户 ${username} 密码验证成功`);
			return user;
		} catch (error) {
			console.error("验证用户失败:", error);
			return null;
		}
	}

	/**
	 * 根据用户ID获取用户信息
	 */
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

	/**
	 * 检查用户名是否已存在
	 */
	static async isUsernameExists(username: string): Promise<boolean> {
		try {
			const [rows] = await mysqlPool.execute("SELECT uid FROM users WHERE username = ?", [username]);
			const users = rows as User[];
			return users.length > 0;
		} catch (error) {
			console.error("检查用户名是否存在失败:", error);
			return false;
		}
	}

	/**
	 * 创建新用户
	 */
	static async createUser(username: string, password: string, roles: string[] = ["Normal"]): Promise<User | null> {
		try {
			// 验证密码强度
			const passwordValidation = PasswordService.validatePasswordPolicy(password);
			if (!passwordValidation.isValid) {
				console.error("密码不符合安全策略:", passwordValidation.errors);
				throw new Error(`密码不符合安全策略: ${passwordValidation.errors.join(", ")}`);
			}

			// 加密密码
			const hashedPassword = await PasswordService.hashPassword(password);

			const [result] = await mysqlPool.execute("INSERT INTO users (username, password, roles) VALUES (?, ?, ?)", [
				username,
				hashedPassword,
				JSON.stringify(roles),
			]);

			const insertResult = result as any;
			const newUser: User = {
				uid: insertResult.insertId,
				username,
				password: hashedPassword, // 返回加密后的密码
				roles,
			};

			console.log(`用户 ${username} 创建成功`);
			return newUser;
		} catch (error) {
			console.error("创建用户失败:", error);
			return null;
		}
	}

	/**
	 * 更新用户信息
	 */
	static async updateUser(uid: number, updates: Partial<Pick<User, "username" | "password" | "roles">>): Promise<boolean> {
		try {
			const updateFields: string[] = [];
			const values: any[] = [];

			if (updates.username) {
				updateFields.push("username = ?");
				values.push(updates.username);
			}
			if (updates.password) {
				// 验证密码强度
				const passwordValidation = PasswordService.validatePasswordPolicy(updates.password);
				if (!passwordValidation.isValid) {
					console.error("密码不符合安全策略:", passwordValidation.errors);
					throw new Error(`密码不符合安全策略: ${passwordValidation.errors.join(", ")}`);
				}

				// 加密密码
				const hashedPassword = await PasswordService.hashPassword(updates.password);
				updateFields.push("password = ?");
				values.push(hashedPassword);
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

			console.log(`用户 ${uid} 更新成功`);
			return updateResult.affectedRows > 0;
		} catch (error) {
			console.error("更新用户失败:", error);
			return false;
		}
	}

	/**
	 * 删除用户
	 */
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

	/**
	 * 获取所有用户
	 */
	static async getAllUsers(): Promise<User[]> {
		try {
			const [rows] = await mysqlPool.execute("SELECT uid, username, password, roles FROM users ORDER BY uid");

			return rows as User[];
		} catch (error) {
			console.error("获取所有用户失败:", error);
			return [];
		}
	}
}
