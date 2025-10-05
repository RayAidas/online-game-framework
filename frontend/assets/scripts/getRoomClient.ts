import { WsClient } from "tsrpc-browser";
import { userManager } from "./shared/models/UserManager";
import { serviceProto } from "./shared/protocols/serviceProto_roomServer";

export const getRoomClient = function () {
	const client = new WsClient(serviceProto, {
		server: "ws://127.0.0.1:3001",
		logger: console,
		json: true, // 确保使用 JSON 模式，与服务器配置一致
	});

	// 监听连接状态
	client.flows.postConnectFlow.push((v) => {
		console.log("[getRoomClient] WebSocket 连接已建立");
		return v;
	});

	client.flows.postDisconnectFlow.push((v) => {
		console.log("[getRoomClient] WebSocket 连接已断开，原因:", v.reason);
		return v;
	});

	// 监听重连事件（如果支持的话）
	// client.flows.postReconnectFlow.push((v) => {
	// 	console.log("[getRoomClient] WebSocket 重连成功");
	// 	return v;
	// });

	client.flows.preCallApiFlow.push((v) => {
		// 获取协议配置
		let conf = client.serviceMap.apiName2Service[v.apiName]!.conf;

		// 自动添加 SSO Token 到请求中（对需要登录的 API）
		if (conf?.needLogin && userManager.ssoToken) {
			(v.req as any).__ssoToken = userManager.ssoToken;
		}

		// 若协议配置为需要登录，则检查用户是否已登录
		if (conf?.needLogin) {
			if (!userManager.currentUser) {
				console.log("[getRoomClient] 需要登录，当前用户:", userManager.currentUser);
				return;
			}
		}

		return v;
	});

	return client;
};
