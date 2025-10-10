import { _decorator, Component, EditBox } from "cc";
import { CurrentUser } from "db://assets/scripts/shared/models/CurrentUser";
import { userManager } from "db://assets/scripts/shared/models/UserManager";
import { ServiceType } from "db://assets/scripts/shared/protocols/serviceProto_userServer";
import { HttpClient } from "tsrpc-browser";
import { getUserClient } from "../getUserClient";
const { ccclass, property } = _decorator;

@ccclass("LoginPanel")
export class LoginPanel extends Component {
	@property(EditBox)
	username: EditBox = null!;
	@property(EditBox)
	password: EditBox = null!;

	client: HttpClient<ServiceType>;
	private currentUser: CurrentUser | null = null;

	protected onLoad(): void {
		this.client = getUserClient();

		// 监听用户状态变化
		userManager.onUserChange((user) => {
			this.currentUser = user;
		});

		// 初始化当前用户状态
		this.currentUser = userManager.currentUser;

		// 自动登录逻辑
		this.autoLogin();
	}

	update(deltaTime: number) {}

	/**
	 * 自动登录逻辑
	 * 检查本地存储中是否有 SSO Token，如果有则尝试自动登录
	 */
	private async autoLogin(): Promise<void> {
		// 如果已经登录，直接返回
		if (this.currentUser) {
			console.log("用户已登录，跳过自动登录");
			return;
		}

		// 检查本地存储中是否有 SSO Token
		const ssoToken = localStorage.getItem("SSO_TOKEN");
		if (!ssoToken) {
			console.log("没有找到 SSO Token，跳过自动登录");
			return;
		}

		console.log("发现 SSO Token，尝试自动登录...");

		// 使用 SSO Token 进行自动登录，不需要用户名密码
		// 后端会通过 SSO Token 验证用户身份并返回用户信息
		this.performAutoLogin(ssoToken);
	}

	/**
	 * 执行自动登录操作（使用 SSO Token）
	 */
	private performAutoLogin(ssoToken: string): void {
		console.log("开始自动登录（使用 SSO Token）...");

		// 创建一个带有 SSO Token 的请求
		const request = {
			__ssoToken: ssoToken,
		};

		// 调用登录 API，但只传递 SSO Token
		// 后端会通过 SSO Token 验证用户身份
		this.client
			.callApi("Login", request)
			.then((result) => {
				if (result.isSucc) {
					console.log("自动登录成功！");
				} else {
					console.log("自动登录失败:", result.err);
					// 清除无效的 Token
					localStorage.removeItem("SSO_TOKEN");
					console.log("已清除无效的 SSO Token，请手动登录");
				}
			})
			.catch((error) => {
				console.log("自动登录出错:", error);
				// 清除无效的 Token
				localStorage.removeItem("SSO_TOKEN");
			});
	}

	/**
	 * 执行手动登录操作（使用用户名密码）
	 */
	private performLogin(): void {
		console.log("开始手动登录（使用用户名密码）...");

		// 验证输入
		if (!this.username.string || !this.password.string) {
			console.log("请输入用户名和密码");
			return;
		}

		this.client.callApi("Login", {
			username: this.username.string,
			password: this.password.string,
		});
	}

	onRegister() {
		this.client.callApi("Register", {
			username: this.username.string,
			password: this.password.string,
		});
	}

	onLogin() {
		// 检查是否已登录
		if (this.currentUser) {
			console.log("用户已登录,无需重复登录");
			return;
		}
		this.performLogin();
	}

	onLogout() {
		this.client.callApi("Logout", {});
	}

	getUserInfo() {
		console.log("当前用户信息:", this.currentUser);
		return this.currentUser;
	}

	/**
	 * 检查是否已登录
	 */
	isLoggedIn(): boolean {
		return userManager.isLoggedIn;
	}

	/**
	 * 获取用户显示名称
	 */
	getUserDisplayName(): string {
		return this.currentUser ? this.currentUser.username : "未登录";
	}
}
