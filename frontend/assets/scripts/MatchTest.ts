import { _decorator, Component } from "cc";
import { HttpClient } from "tsrpc-browser";
import { getMatchClient } from "./getMatchClient";
import { CurrentUser } from "./shared/models/CurrentUser";
import { userManager } from "./shared/models/UserManager";
import { ServiceType } from "./shared/protocols/serviceProto_matchServer";
const { ccclass, property } = _decorator;

@ccclass("MatchTest")
export class MatchTest extends Component {
	client: HttpClient<ServiceType>;
	private currentUser: CurrentUser | null = null;

	protected onLoad(): void {
		this.client = getMatchClient();

		// 监听用户状态变化
		userManager.onUserChange((user) => {
			this.currentUser = user;
		});

		// 初始化当前用户状态
		this.currentUser = userManager.currentUser;

		this.client.flows.preCallApiFlow.push((v) => {
			// 获取协议配置
			let conf = this.client.serviceMap.apiName2Service[v.apiName]!.conf;
			// 若协议配置为需要登录，则检查用户是否已登录
			if (conf?.needLogin) {
				if (!this.currentUser) {
					console.log("需要登录，当前用户:", this.currentUser);
					return;
				}
				console.log("用户已登录，允许调用API:", this.currentUser.username);
			}

			return v;
		});
	}

	update(deltaTime: number) {}

	onCreateRoom() {
		if (!this.currentUser) {
			console.log("请先登录");
			return;
		}

		this.client.callApi("CreateRoom", {
			roomName: "TestRoom",
		});
	}

	onLogout() {
		userManager.logout();
		console.log("用户已登出");
	}
}
