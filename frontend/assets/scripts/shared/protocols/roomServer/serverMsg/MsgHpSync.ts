/**
 * 服务器血量同步消息
 * 定期广播权威血量，防止作弊和客户端误差累积
 */
export interface MsgHpSync {
	/** 所有玩家的血量数据 */
	hpData: {
		[playerId: string]: number;
	};
	/** 时间戳 */
	timestamp: number;
}
