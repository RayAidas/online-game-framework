import { DatabaseService, TokenService } from "./services";
import { UserServer } from "./UserServer/UserServer";

export const userServer = new UserServer({
	port: 3003,
});

// 定期清理过期 token 的定时任务
let cleanupInterval: NodeJS.Timeout | null = null;

function startTokenCleanup() {
	// 每 5 分钟清理一次过期的 token
	cleanupInterval = setInterval(async () => {
		try {
			const cleanedCount = await TokenService.cleanupExpiredTokens();
			if (cleanedCount > 0) {
				console.log(`定时清理完成，清理了 ${cleanedCount} 个过期 token`);
			}
		} catch (error) {
			console.error("定时清理 token 失败:", error);
		}
	}, 5 * 60 * 1000); // 5 分钟
}

function stopTokenCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}
}

// Entry function
async function main() {
	// 初始化数据库连接
	await DatabaseService.initialize();

	// 启动定时清理任务
	startTokenCleanup();

	await userServer.init();
	await userServer.start();
}

main().catch((e) => {
	// Exit if any error during the startup
	userServer.server.logger.error(e);
	process.exit(-1);
});
