import { MsgSyncFrame } from "../../../types/FrameSync";
import { BaseConf, BaseRequest, BaseResponse } from "../../base";

export interface ReqSyncFrame extends BaseRequest, MsgSyncFrame {}

export interface ResSyncFrame extends BaseResponse {}

export const conf: BaseConf = {
	needLogin: true,
};
