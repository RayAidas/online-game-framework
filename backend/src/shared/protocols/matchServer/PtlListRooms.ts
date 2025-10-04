import { uint } from "tsrpc-proto";
import { BaseConf } from "../base";
export interface ReqListRooms {}

export interface ResListRooms {
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
