import { BaseRequest, BaseResponse } from "../base";

export interface ReqClearUserRoomState extends BaseRequest {
	userId: number;
}

export interface ResClearUserRoomState extends BaseResponse {
	// 空响应
}
