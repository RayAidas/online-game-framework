import { RoomUserState } from "../../../types/RoomUserState";

// 客户端发送的消息包含所有玩家的状态
export interface MsgUserState {
	states: {
		[playerId: string]: RoomUserState;
	};
}
