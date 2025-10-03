import { _decorator, Component } from "cc";
import { HttpClient } from "tsrpc-browser";
import { getClient } from "./client";
import { ServiceType } from "./shared/protocols/serviceProto";
const { ccclass, property } = _decorator;

@ccclass("UserTest")
export class UserTest extends Component {
	client: HttpClient<ServiceType>;

	protected onLoad(): void {
		this.client = getClient();
	}

	update(deltaTime: number) {}

	onLogin() {
		this.client.callApi("user/Login", {
			username: "Admin",
			password: "123456",
		});
	}
}
