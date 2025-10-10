import { HttpClient as browserHttpClient, WsClient as browserWsClient } from "tsrpc-browser";
import { HttpClient as miniHttpClient, WsClient as miniWsClient } from "tsrpc-miniapp";

// 判断环境并导出对应的客户端类
let HttpClient: typeof browserHttpClient;
let WsClient: typeof browserWsClient;

if (typeof window !== "undefined" && typeof document !== "undefined") {
	// 浏览器环境
	HttpClient = browserHttpClient;
	WsClient = browserWsClient;
} else if (typeof globalThis.wx !== "undefined") {
	// 小程序环境
	HttpClient = miniHttpClient as any;
	WsClient = miniWsClient as any;
} else {
	throw new Error("Unsupported environment");
}

export { HttpClient, WsClient };
