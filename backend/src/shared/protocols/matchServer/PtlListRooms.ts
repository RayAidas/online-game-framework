import { uint } from "tsrpc-proto";
import { BaseConf, BaseRequest, BaseResponse } from "../base";
export interface ReqListRooms extends BaseRequest {}

export interface ResListRooms extends BaseResponse {
	rooms: {
		name: string;
		userNum: uint;
		maxUserNum: uint;
		serverUrl: string;
		roomId: string;
	}[];
}

export const conf: BaseConf = {
	needLogin: true,
};
