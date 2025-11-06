import { TurnData } from "../../../types/TurnData";
import { UserInfo } from "../../../types/UserInfo";

/**
 * 回合变更消息
 */
export interface MsgTurnChanged {
	/** 回合数据 */
	turnData: TurnData;
	/** 当前回合玩家 */
	currentPlayer?: UserInfo & { color: { r: number; g: number; b: number } };
}
