import { MsgSyncState } from "../../../types/FrameSync";
import { BaseRequest, BaseResponse, BaseConf } from "../../base";

export interface ReqSyncState extends BaseRequest, MsgSyncState {}

export interface ResSyncState extends BaseResponse {}

export const conf: BaseConf = {
	needLogin: true,
};
