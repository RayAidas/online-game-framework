import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqStartMatch extends BaseRequest {}

export interface ResStartMatch extends BaseResponse {
	serverUrl: string;
	roomId: string;
}

export const conf: BaseConf = {
	needLogin: true,
};
