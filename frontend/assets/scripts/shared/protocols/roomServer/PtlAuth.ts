import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqAuth extends BaseRequest {
	matchConnectToken: string;
	type: "MatchServer";
}

export interface ResAuth extends BaseResponse {}

export const conf: BaseConf = {};
