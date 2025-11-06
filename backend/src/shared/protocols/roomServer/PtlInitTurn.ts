/**
 * 初始化回合制
 */
export interface ReqInitTurn {
	/** 先手玩家的座位号，默认为0 */
	firstPlayerSeatIndex?: number;
	/** 回合超时时间（毫秒），0表示无限制 */
	turnTimeout?: number;
}

export interface ResInitTurn {
	success: boolean;
}
