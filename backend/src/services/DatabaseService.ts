import { mysqlPool, redisClient } from "../models/Database";

/**
 * 数据库管理服务
 * 负责数据库连接的初始化和关闭
 */
export class DatabaseService {
	/**
	 * 初始化所有数据库连接
	 */
	static async initialize(): Promise<void> {
		try {
			// 连接 Redis
			await redisClient.connect();
			console.log("Redis 连接成功");

			// MySQL 连接池在创建时就已经建立连接，无需手动连接
			console.log("MySQL 连接池已就绪");

			console.log("数据库服务初始化完成");
		} catch (error) {
			console.error("数据库服务初始化失败:", error);
			throw error;
		}
	}

	/**
	 * 关闭所有数据库连接
	 */
	static async close(): Promise<void> {
		try {
			await redisClient.quit();
			await mysqlPool.end();
			console.log("数据库连接已关闭");
		} catch (error) {
			console.error("关闭数据库连接失败:", error);
		}
	}

	/**
	 * 检查数据库连接状态
	 */
	static async checkHealth(): Promise<{
		redis: boolean;
		mysql: boolean;
		overall: boolean;
	}> {
		const health = {
			redis: false,
			mysql: false,
			overall: false,
		};

		try {
			// 检查 Redis 连接
			await redisClient.ping();
			health.redis = true;
		} catch (error) {
			console.error("Redis 健康检查失败:", error);
		}

		try {
			// 检查 MySQL 连接
			await mysqlPool.execute("SELECT 1");
			health.mysql = true;
		} catch (error) {
			console.error("MySQL 健康检查失败:", error);
		}

		health.overall = health.redis && health.mysql;
		return health;
	}
}
