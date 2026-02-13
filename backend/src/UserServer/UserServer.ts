import path from "path";
import { HttpServer } from "tsrpc";
import { enableAuthentication, parseCurrentUser } from "../flows/UserFlows";
import { serviceProto } from "../shared/protocols/serviceProto_userServer";

/**
 * 简单的内存限流 Map
 * 生产环境建议使用 redis 或专门的限流服务
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * 限流检查
 * @param key 标识符 (如 IP 或用户ID)
 * @param maxRequests 最大请求数
 * @param windowMs 时间窗口 (毫秒)
 */
function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(key);

	if (!record || now > record.resetTime) {
		// 新窗口
		rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
		return true;
	}

	if (record.count >= maxRequests) {
		// 超出限制
		return false;
	}

	record.count++;
	return true;
}

/**
 * 清理过期的限流记录（每分钟清理一次）
 */
setInterval(() => {
	const now = Date.now();
	for (const [key, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(key);
		}
	}
}, 60000);

export interface UserServerOptions {
	port: number;
	// CORS 白名单，默认只允许本地域名
	corsOrigins?: string[];
}

export class UserServer {
	public readonly server: HttpServer = new HttpServer(serviceProto, {
		port: this.options.port,
		json: true,
		// 默认只允许本地域名，生产环境应配置具体域名
		cors: this.options.corsOrigins || ["http://localhost:3003", "http://localhost:8080"],
	});

	constructor(public readonly options: UserServerOptions) {
		// 启用用户认证流程
		parseCurrentUser(this.server);
		enableAuthentication(this.server);
	}

	async init() {
		await this.server.autoImplementApi(path.resolve(__dirname, "api"));
	}

	async start() {
		await this.server.start();
	}
}

export { checkRateLimit };
