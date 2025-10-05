import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqCreateRoom extends BaseRequest {
	matchConnectToken: string;
	roomName: string;
}

export interface ResCreateRoom extends BaseResponse {
	roomId: string;
}

export const conf: BaseConf = {
	needLogin: true,
};
