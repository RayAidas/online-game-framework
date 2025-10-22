import { UserInfo } from "../../../types/UserInfo";

/** 用户离线消息 */
export interface MsgUserOffline {
	time: Date;
	user: UserInfo;
}
