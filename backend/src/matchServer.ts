import { MatchServer } from "./MatchServer/MatchServer";
import { DatabaseService } from "./services";

// env config
const port = parseInt(process.env.MATCH_PORT || "3004");

export const matchServer = new MatchServer({
	port: port,
});

// Entry function
async function main() {
	// 初始化数据库连接
	await DatabaseService.initialize();

	await matchServer.init();
	await matchServer.start();
}

main();
