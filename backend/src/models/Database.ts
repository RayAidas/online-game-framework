import "dotenv/config";
import mysql from "mysql2/promise";
import { createClient } from "redis";

// MySQL 数据库配置
const mysqlConfig = {
	host: process.env.MYSQL_HOST || "localhost",
	port: parseInt(process.env.MYSQL_PORT || "3306"),
	user: process.env.MYSQL_USER || "root",
	password: process.env.MYSQL_PASSWORD || "password",
	database: process.env.MYSQL_DATABASE || "gameonline",
	charset: "utf8mb4",
};

// Redis 配置
const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: parseInt(process.env.REDIS_PORT || "6379"),
	password: process.env.REDIS_PASSWORD || undefined,
	db: parseInt(process.env.REDIS_DB || "0"),
};

// 创建 MySQL 连接池
export const mysqlPool = mysql.createPool({
	...mysqlConfig,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// 创建 Redis 客户端
export const redisClient = createClient({
	socket: {
		host: redisConfig.host,
		port: redisConfig.port,
	},
	password: redisConfig.password,
	database: redisConfig.db,
});

// 连接 Redis
redisClient.on("error", (err) => {
	console.error("Redis 连接错误:", err);
});

redisClient.on("connect", () => {
	console.log("Redis 连接成功");
});

// 用户接口定义
export interface User {
	uid: number;
	username: string;
	password: string;
	email?: string;
	roles: string[];
	created_at?: Date;
	updated_at?: Date;
}

// SSO Token 信息接口
export interface SSOTokenInfo {
	uid: number;
	expiredTime: number;
}
