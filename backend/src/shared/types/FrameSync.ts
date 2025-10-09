/**连接输入的操作内容*/
export interface ConnectionInputOperate {
	[key: string]: any;
}

/**连接输入帧(包含多个操作)*/
export interface ConnectionInputFrame {
	/** 来源的连接ID */
	connectionId: string;
	/**本帧本用户的操作列表*/
	operates: ConnectionInputOperate[];
	/**可自行拓展其他字段*/
	[key: string]: any;
}

/**游戏同步帧*/
export interface GameSyncFrame {
	/** 连接输入帧列表, undefined|null 则表示空帧 */
	connectionInputs: ConnectionInputFrame[];

	/**可自行拓展其他字段*/
	[key: string]: any;
}

/**
 * 构建游戏同步帧时走这里
 * @returns game sync frame
 */
export function buildGameSyncFrame(): GameSyncFrame {
	return {
		connectionInputs: [],
	};
}

/**
 * 构建连接输入帧
 * @param connectionId 连接ID
 * @param inpFrame 输入帧
 * @returns connection input frame
 */
export function buildConnectionInputFrame(connectionId: string, inpFrame: MsgInpFrame): ConnectionInputFrame {
	return {
		connectionId: connectionId,
		operates: inpFrame.operates,
	};
}

/**客户端发送给服务端的输入帧消息*/
export interface MsgInpFrame {
	/**本帧本用户的操作列表*/
	operates: ConnectionInputOperate[];
	/**可自行拓展其他字段*/
	[key: string]: any;
}

/**服务端广播给所有客户端的每帧数据*/
export interface MsgSyncFrame {
	/**要同步的游戏帧数据*/
	syncFrame: GameSyncFrame;
	/**游戏帧所属索引*/
	frameIndex: number;
}

/**服务端发送给客户端的追帧数据*/
export interface MsgAfterFrames {
	/**追帧列表*/
	afterFrames: GameSyncFrame[];
	/**追帧起始帧索引*/
	startFrameIndex: number;
}

/**客户端请求状态同步*/
export interface MsgRequireSyncState {
	/**请求的帧索引*/
	frameIndex: number;
}

/**服务端发送状态同步数据*/
export interface MsgSyncState {
	/**状态数据*/
	stateData: any;
	/**状态对应的帧索引*/
	stateFrameIndex: number;
}
