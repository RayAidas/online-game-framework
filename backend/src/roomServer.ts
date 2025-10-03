import "./models/parseCurrentUser";
import { UserUtil } from "./models/UserUtil";
import { RoomServer } from "./RoomServer/RoomServer";

// env config
const port = parseInt(process.env["PORT"] || "3001");
const matchServerUrl = process.env["MATCH_SERVER_URL"] || "http://127.0.0.1:3000";
const thisServerUrl = process.env["THIS_SERVER_URL"] || "ws://127.0.0.1:" + port;

export const roomServer = new RoomServer({
	// 可改为通过环境变量调整配置参数
	port: port,
	matchServerUrl: matchServerUrl,
	thisServerUrl: thisServerUrl,
});

roomServer.server.flows.preApiCallFlow.push(async (call) => {
	// 解析登录态
	call.currentUser = await UserUtil.parseSSO(call.req.__ssoToken);
	// 获取协议配置
	let conf = call.service.conf;
	// 若协议配置为需要登录，则阻止未登录的请求
	if (conf?.needLogin && !call.currentUser) {
		call.error("您还未登录", { code: "NEED_LOGIN" });
		return undefined;
	}

	return call;
});

// Entry function
async function main() {
	await roomServer.init();
	await roomServer.start();
}
main();
