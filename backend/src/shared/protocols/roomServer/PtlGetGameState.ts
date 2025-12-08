/**
 * 获取游戏状态（用于重连恢复）
 */
export interface ReqGetGameState {}

export interface ResGetGameState {
	/** 游戏状态数据 */
	gameState?: any;
	/** 是否有游戏状态 */
	hasState: boolean;
}
