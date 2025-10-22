import { UserInfo } from "../../../types/UserInfo";

/** 用户上线消息 */
export interface MsgUserOnline {
	time: Date;
	user: UserInfo;
}
