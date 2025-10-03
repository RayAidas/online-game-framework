import { CurrentUser } from "./CurrentUser";

class UserManager {
	private _currentUser: CurrentUser | null = null;
	private _listeners: Array<(user: CurrentUser | null) => void> = [];

	get currentUser(): CurrentUser | null {
		return this._currentUser;
	}

	set currentUser(user: CurrentUser | null) {
		this._currentUser = user;
		this._listeners.forEach((listener) => listener(user));
	}

	// 添加用户状态变化监听器
	onUserChange(listener: (user: CurrentUser | null) => void) {
		this._listeners.push(listener);
	}

	// 移除用户状态变化监听器
	offUserChange(listener: (user: CurrentUser | null) => void) {
		const index = this._listeners.indexOf(listener);
		if (index > -1) {
			this._listeners.splice(index, 1);
		}
	}

	// 检查是否已登录
	get isLoggedIn(): boolean {
		return this._currentUser !== null;
	}

	// 登出
	logout() {
		this.currentUser = null;
		localStorage.removeItem("SSO_TOKEN");
	}
}

// 导出单例实例
export const userManager = new UserManager();
