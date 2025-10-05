import { CurrentUser } from "../../models/CurrentUser";
import { BaseConf, BaseRequest, BaseResponse } from "../base";

export interface ReqRegister extends BaseRequest {
	username: string;
	password: string;
}

export interface ResRegister extends BaseResponse {
	__ssoToken: string;
	user: CurrentUser;
}

export const conf: BaseConf = {};
