declare module "tsrpc" {
	export interface ApiCall {
		currentUser?: CurrentUser;
	}
}
export interface CurrentUser {
    uid: number,
    username: string,
    roles: string[]
}