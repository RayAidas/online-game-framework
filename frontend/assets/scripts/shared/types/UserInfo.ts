import { GamePhase } from "./GamePhase";

export interface UserInfo {
	id: string;
	nickname: string;
	isReady?: boolean;
	/** 是否离线（断线但仍在房间中） */
	isOffline?: boolean;
	gamePhase: GamePhase; // 初始化为准备阶段
	/** 座位号，按加入房间顺序递增，从0开始 */
	seatIndex?: number;
}
