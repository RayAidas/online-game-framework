import { GameSyncFrame } from "../../types/FrameSync";
import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqRequestGameState extends BaseRequest {}

export interface ResRequestGameState extends BaseResponse {
	/** 当前游戏状态数据 */
	stateData: any;
	/** 状态对应的帧索引 */
	stateFrameIndex: number;
	/** 状态之后的追帧数据 */
	afterFrames: GameSyncFrame[];
	/** 追帧起始帧索引 */
	startFrameIndex: number;
	/** 当前最大帧索引 */
	currentFrameIndex: number;
}

export const conf: BaseConf = {
	needLogin: true,
};
