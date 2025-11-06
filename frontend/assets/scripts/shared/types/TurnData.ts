/**
 * 回合数据
 */
export interface TurnData {
	/** 当前回合玩家的座位号 */
	currentSeatIndex: number;
	/** 当前回合数（从1开始） */
	turnNumber: number;
	/** 回合开始时间 */
	turnStartTime: number;
	/** 回合超时时间（毫秒），0表示无限制 */
	turnTimeout: number;
	/** 先手玩家的座位号 */
	firstPlayerSeatIndex: number;
	/** 是否启用回合制 */
	isEnabled: boolean;
	/** 最后一个操作的玩家ID */
	lastPlayedId?: string;
}
