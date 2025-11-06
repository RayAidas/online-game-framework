import { TurnData } from "../../../types/TurnData";

/**
 * 回合超时消息
 */
export interface MsgTurnTimeout {
	/** 回合数据 */
	turnData?: TurnData;
}
