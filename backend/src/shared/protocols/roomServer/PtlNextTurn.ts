/**
 * 切换到下一个玩家的回合
 */
export interface ReqNextTurn {
	/** 回合数据，包含lastPlayedId和lastCards等信息 */
	data?: {
		lastPlayedId?: string;
		lastCards?: any[];
		[key: string]: any;
	};
}

export interface ResNextTurn {
	success: boolean;
}
