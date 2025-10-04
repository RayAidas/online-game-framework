import { ApiCall } from "tsrpc";
import { DatabaseService } from "../../services";

export interface ReqHealth {
	// 健康检查请求不需要参数
}

export interface ResHealth {
	status: "healthy" | "unhealthy";
	timestamp: number;
	services: {
		redis: boolean;
		mysql: boolean;
		overall: boolean;
	};
	uptime: number;
}

export async function ApiHealth(call: ApiCall<ReqHealth, ResHealth>) {
	try {
		const health = await DatabaseService.checkHealth();
		const uptime = process.uptime();

		call.succ({
			status: health.overall ? "healthy" : "unhealthy",
			timestamp: Date.now(),
			services: health,
			uptime: Math.floor(uptime),
		});
	} catch (error) {
		console.error("健康检查失败:", error);
		call.error("健康检查失败", { code: "HEALTH_CHECK_ERROR" });
	}
}
