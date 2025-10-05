import path from "path";
import { HttpServer } from "tsrpc";
import { enableAuthentication, parseCurrentUser } from "../flows/UserFlows";
import { serviceProto } from "../shared/protocols/serviceProto_userServer";

export interface UserServerOptions {
	port: number;
}

export class UserServer {
	public readonly server: HttpServer = new HttpServer(serviceProto, {
		port: this.options.port,
		json: true,
		cors: "*",
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
