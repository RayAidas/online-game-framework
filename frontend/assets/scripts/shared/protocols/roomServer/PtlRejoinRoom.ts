import { GamePhase } from "../../types/GamePhase";
import { RoomData } from "../../types/RoomData";
import { UserInfo } from "../../types/UserInfo";
import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqRejoinRoom extends BaseRequest {
	// 可选：如果知道之前的房间ID，可以传入
	roomId?: string;
}

export interface ResRejoinRoom extends BaseResponse {
	roomData: RoomData;
	currentUser: UserInfo;
	// 是否是重连（true）还是首次加入（false）
	isRejoin: boolean;
	// 当前游戏阶段
	gamePhase: GamePhase;
}

export const conf: BaseConf = {
	needLogin: true,
};
