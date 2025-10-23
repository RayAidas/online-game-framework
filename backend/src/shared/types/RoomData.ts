import { uint } from "tsrpc-proto";
import { GamePhase } from "./GamePhase";
import { UserInfo } from "./UserInfo";

export interface RoomData {
	id: string;
	name: string;
	seed: number;
	/** 房间可容纳的最大人数 */
	maxUser: uint;
	/** 房间内的用户 */
	users: (UserInfo & { color: { r: uint; g: uint; b: uint } })[];
	/** 房主用户ID */
	ownerId: string;
	/** 历史消息（只保留最近的 N 条） */
	messages: {
		user: UserInfo;
		time: Date;
		content: string;
	}[];

	/**
	 * 上一次空房的时间（undefined 代表房内有人）
	 * 用于定时解散无人的房间
	 */
	lastEmptyTime?: number;

	/**
	 * 开始匹配的时间，`undefined` 代表不在匹配中
	 */
	startMatchTime?: number;

	/** 房间信息的最后更新时间 */
	updateTime: number;
}
