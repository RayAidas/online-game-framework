import { UserInfo } from "../../../types/UserInfo";

export interface MsgOwnerChanged {
	time: Date;
	newOwner: UserInfo;
	oldOwner: UserInfo;
}
