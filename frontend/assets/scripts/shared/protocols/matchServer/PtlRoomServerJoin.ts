import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqRoomServerJoin extends BaseRequest {
	token: string;
	/** RoomServer 的连接地址 */
	serverUrl: string;
}

export interface ResRoomServerJoin extends BaseResponse {}

export const conf: BaseConf = {};
