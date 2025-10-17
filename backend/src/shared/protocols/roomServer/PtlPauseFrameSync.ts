import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqPauseFrameSync extends BaseRequest {
    
}

export interface ResPauseFrameSync extends BaseResponse {
    
}

export const conf: BaseConf = {
    needLogin: true,
}