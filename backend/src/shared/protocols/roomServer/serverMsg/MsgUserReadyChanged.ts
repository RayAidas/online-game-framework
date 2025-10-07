import { UserInfo } from "../../../types/UserInfo";

export interface MsgUserReadyChanged {
	time: Date;
	user: UserInfo;
	isReady: boolean;
}
