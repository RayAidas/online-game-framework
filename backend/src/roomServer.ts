import { RoomServer } from "./RoomServer/RoomServer";
import { DatabaseService } from "./services";

// env config
const port = parseInt(process.env.ROOM_PORT || "3001");
const matchServerUrl = process.env["MATCH_SERVER_URL"] || "http://127.0.0.1:3004";
const thisServerUrl = process.env["THIS_SERVER_URL"] || "ws://127.0.0.1:" + port;

export const roomServer = new RoomServer({
	// 可改为通过环境变量调整配置参数
	port: port,
	matchServerUrl: matchServerUrl,
	thisServerUrl: thisServerUrl,
});

// Entry function
async function main() {
	// 初始化数据库连接
	await DatabaseService.initialize();

	await roomServer.init();
	await roomServer.start();
}
main();
