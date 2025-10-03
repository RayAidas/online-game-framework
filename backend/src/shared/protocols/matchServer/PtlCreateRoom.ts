import { BaseConf } from "../base";

export interface ReqCreateRoom {
	roomName: string;
}

export interface ResCreateRoom {
	serverUrl: string;
	roomId: string;
}

export const conf: BaseConf = {
	needLogin: true,
};
