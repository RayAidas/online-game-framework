import { buildConnectionInputFrame, buildGameSyncFrame, GameSyncFrame, MsgSyncFrame } from "../shared/types/FrameSync";

/**
 * 服务端帧同步执行器
 * 负责收集客户端输入，按帧率生成同步帧，管理游戏状态
 */
export class FrameSyncService {
	/**空帧对象*/
	private static noneFrame: GameSyncFrame = { connectionInputs: [] };

	/**同步帧率(每秒多少帧),默认每秒60帧*/
	private _syncFrameRate: number;
	/**帧同步的定时器句柄*/
	private _frameUpdateHD!: any;
	/**同步每一帧的临时消息*/
	private _syncOneFrameTempMsg: MsgSyncFrame = {
		frameIndex: 0,
		syncFrame: FrameSyncService.noneFrame,
	};
	/**同步每一帧需要的处理器*/
	private onSyncOneFrame: (msg: MsgSyncFrame) => void;

	private _syncing: boolean = false;
	/**当前是否在执行帧同步中*/
	get syncing() {
		return this._syncing;
	}

	private _nextSyncFrameIndex = 0;
	/**下次同步的帧索引,从0开始, 执行完一次帧同步后值会更新为下一帧的帧索引*/
	get nextSyncFrameIndex() {
		return this._nextSyncFrameIndex;
	}

	private _maxSyncFrameIndex = -1;
	/**当前最大帧索引*/
	get maxSyncFrameIndex() {
		return this._maxSyncFrameIndex;
	}

	private _afterFrames: GameSyncFrame[] = [];
	/**最后记录的游戏状态之后的帧列表*/
	get afterFrames() {
		return this._afterFrames;
	}

	private _lastStateData: any = {};
	/**当前最后一次游戏状态数据*/
	get lastStateData() {
		return this._lastStateData;
	}

	private _lastStateDataFrameIndex = -1;
	/**最后一次游戏状态数据对应的帧索引*/
	get lastStateDataFrameIndex() {
		return this._lastStateDataFrameIndex;
	}

	/**当前帧收集的输入数据*/
	private _currentFrameInputs: Map<string, any> = new Map();

	constructor(onSyncOneFrame: (msg: MsgSyncFrame) => void, syncFrameRate: number = 60) {
		this.onSyncOneFrame = onSyncOneFrame;
		this._syncFrameRate = syncFrameRate;
	}

	/**
	 * 开始帧同步
	 */
	startSyncFrame() {
		if (this._syncing) {
			return;
		}
		this._syncing = true;
		const frameInterval = 1000 / this._syncFrameRate; // 计算每帧间隔
		this._frameUpdateHD = setInterval(() => {
			this.syncOneFrame();
		}, frameInterval);
		console.log(`帧同步开始，帧率: ${this._syncFrameRate}fps，间隔: ${frameInterval}ms`);
	}

	/**
	 * 停止帧同步
	 */
	stopSyncFrame() {
		if (!this._syncing) {
			return;
		}
		this._syncing = false;
		if (this._frameUpdateHD) {
			clearInterval(this._frameUpdateHD);
			this._frameUpdateHD = null;
		}
		console.log("帧同步停止");
	}

	/**
	 * 同步一帧
	 */
	private syncOneFrame() {
		// 构建当前帧的输入数据
		const currentFrame = this.buildCurrentFrame();

		// 更新帧索引
		this._syncOneFrameTempMsg.frameIndex = this._nextSyncFrameIndex;
		this._syncOneFrameTempMsg.syncFrame = currentFrame;

		// 广播帧数据
		this.onSyncOneFrame(this._syncOneFrameTempMsg);

		// 更新帧索引
		this._nextSyncFrameIndex++;
		this._maxSyncFrameIndex = this._nextSyncFrameIndex - 1;

		// 清空当前帧输入
		this._currentFrameInputs.clear();
	}

	/**
	 * 构建当前帧
	 */
	private buildCurrentFrame(): GameSyncFrame {
		const frame = buildGameSyncFrame();

		// 添加所有连接的输入
		for (const [connId, inputData] of this._currentFrameInputs) {
			frame.connectionInputs.push(buildConnectionInputFrame(connId, inputData));
		}

		return frame;
	}

	/**
	 * 添加连接输入帧
	 */
	addConnectionInpFrame(connId: string, inpFrame: any) {
		this._currentFrameInputs.set(connId, inpFrame);
	}

	/**
	 * 移除连接
	 */
	removeConnection(connId: string) {
		this._currentFrameInputs.delete(connId);
	}

	/**
	 * 同步状态数据
	 */
	syncStateData(stateData: any, frameIndex: number) {
		this._lastStateData = stateData;
		this._lastStateDataFrameIndex = frameIndex;
		console.log(`同步状态数据，帧索引: ${frameIndex}`);
	}

	/**
	 * 获取追帧数据
	 */
	getAfterFrames(startFrameIndex: number): GameSyncFrame[] {
		const afterFrames: GameSyncFrame[] = [];
		const startIndex = startFrameIndex - this._lastStateDataFrameIndex - 1;

		if (startIndex >= 0 && startIndex < this._afterFrames.length) {
			for (let i = startIndex; i < this._afterFrames.length; i++) {
				afterFrames.push(this._afterFrames[i]);
			}
		}

		return afterFrames;
	}

	/**
	 * 获取当前帧索引
	 */
	getCurrentFrameIndex(): number {
		return this._nextSyncFrameIndex - 1;
	}
}
