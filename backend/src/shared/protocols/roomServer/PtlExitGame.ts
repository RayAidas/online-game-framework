import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqExitGame extends BaseRequest {
    
}

export interface ResExitGame extends BaseResponse {
    
}

export const conf: BaseConf = {
    needLogin: true,
}