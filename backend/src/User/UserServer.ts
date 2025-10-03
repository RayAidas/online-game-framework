import path from "path";
import { HttpServer } from "tsrpc";
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

	}

	async init() {
		await this.server.autoImplementApi(path.resolve(__dirname, "api"));
	}

	async start() {
		await this.server.start();
	}
}
