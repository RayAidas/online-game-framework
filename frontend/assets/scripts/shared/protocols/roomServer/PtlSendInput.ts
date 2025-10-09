import { ConnectionInputOperate } from "../../types/FrameSync";
import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqSendInput extends BaseRequest {
	/**本帧本用户的操作列表*/
	operates: ConnectionInputOperate[];
}

export interface ResSendInput extends BaseResponse {}

export const conf: BaseConf = {
	needLogin: true,
};
