/**
 * 同步游戏状态
 */
export interface ReqSyncGameState {
	/** 游戏状态数据，null表示清除状态 */
	gameState?: any;
}

export interface ResSyncGameState {
	success: boolean;
}
