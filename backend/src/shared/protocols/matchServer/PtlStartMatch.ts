import { BaseConf } from "../base";

export interface ReqStartMatch {}

export interface ResStartMatch {
	serverUrl: string;
	roomId: string;
}

export const conf: BaseConf = {
	needLogin: true,
};
