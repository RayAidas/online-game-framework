import { GamePhase } from "./GamePhase";

export interface UserInfo {
	id: string;
	nickname: string;
	isReady?: boolean;
	/** 是否离线（断线但仍在房间中） */
	isOffline?: boolean;
	gamePhase: GamePhase; // 初始化为准备阶段
}
