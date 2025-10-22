/**
 * 游戏阶段枚举
 */
export enum GamePhase {
	/** 准备阶段 - 等待玩家准备 */
	WAITING = "WAITING",
	/** 游戏中 - 游戏正在进行 */
	PLAYING = "PLAYING",
	/** 游戏结束 - 显示结果 */
	FINISHED = "FINISHED",
}
