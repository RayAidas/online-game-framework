import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqCreateRoom extends BaseRequest {
	roomName: string;
}

export interface ResCreateRoom extends BaseResponse {
	serverUrl: string;
	roomId: string;
}

export const conf: BaseConf = {
	needLogin: true,
};
