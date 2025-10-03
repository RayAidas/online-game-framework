import { MatchServer } from "./MatchServer/MatchServer";
import { UserUtil } from "./models/UserUtil";
import "./models/parseCurrentUser";

// env config
const port = parseInt(process.env["PORT"] || "3000");

export const matchServer = new MatchServer({
	port: port,
});

matchServer.server.flows.preApiCallFlow.push(async (call) => {
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
	await matchServer.init();
	await matchServer.start();
}
main();
