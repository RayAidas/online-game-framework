import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqGameOver extends BaseRequest {
	playerId: string;
}

export interface ResGameOver extends BaseResponse {
	
}

export const conf: BaseConf = {
	needLogin: true,
};
