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

	private _paused: boolean = false;
	/**当前是否暂停*/
	get paused() {
		return this._paused;
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

	/**状态快照更新间隔（帧数），每60帧（1秒）更新一次状态快照*/
	private _stateSnapshotInterval = 60;
	/**距离上次状态快照的帧数计数*/
	private _framesSinceLastSnapshot = 0;
	/**状态快照回调函数，用于获取当前游戏状态*/
	private _getStateSnapshotCallback?: () => any;

	constructor(onSyncOneFrame: (msg: MsgSyncFrame) => void, syncFrameRate: number = 60, getStateSnapshot?: () => any) {
		this.onSyncOneFrame = onSyncOneFrame;
		this._syncFrameRate = syncFrameRate;
		this._getStateSnapshotCallback = getStateSnapshot;
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
		// 如果暂停，不执行帧同步
		if (this._paused) {
			return;
		}

		// 构建当前帧的输入数据
		const currentFrame = this.buildCurrentFrame();

		// 更新帧索引
		this._syncOneFrameTempMsg.frameIndex = this._nextSyncFrameIndex;
		this._syncOneFrameTempMsg.syncFrame = currentFrame;

		// 保存追帧数据（用于断线重连）
		this._afterFrames.push(currentFrame);

		// 定期更新状态快照
		this._framesSinceLastSnapshot++;
		if (this._framesSinceLastSnapshot >= this._stateSnapshotInterval) {
			this.updateStateSnapshot();
			this._framesSinceLastSnapshot = 0;
		}

		// 限制追帧数量，保留最近600帧（约10秒，给断线重连留足够的时间）
		// 当追帧数量超过限制时，更新状态快照并清理旧帧
		if (this._afterFrames.length > 600) {
			// 强制更新状态快照
			this.updateStateSnapshot();
			// 清理旧的追帧数据，只保留最近300帧
			const framesToRemove = this._afterFrames.length - 300;
			this._afterFrames.splice(0, framesToRemove);
			this._lastStateDataFrameIndex += framesToRemove;
			console.log(`[FrameSyncService] 清理了 ${framesToRemove} 个旧帧，当前状态帧索引: ${this._lastStateDataFrameIndex}`);
		}

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
	 * 同步状态数据（外部调用）
	 */
	syncStateData(stateData: any, frameIndex: number) {
		this._lastStateData = stateData;
		this._lastStateDataFrameIndex = frameIndex;
		console.log(`[FrameSyncService] 外部同步状态数据，帧索引: ${frameIndex}`);
	}

	/**
	 * 更新状态快照（内部自动调用）
	 * 定期保存游戏状态，确保断线重连时不会丢失重要数据
	 */
	private updateStateSnapshot() {
		if (this._getStateSnapshotCallback) {
			try {
				const snapshot = this._getStateSnapshotCallback();
				if (snapshot) {
					this._lastStateData = snapshot;
					this._lastStateDataFrameIndex = this._nextSyncFrameIndex - 1;
					console.log(`[FrameSyncService] 自动更新状态快照，帧索引: ${this._lastStateDataFrameIndex}`);
				}
			} catch (error) {
				console.error("[FrameSyncService] 更新状态快照失败:", error);
			}
		} else {
			console.warn("[FrameSyncService] 未设置状态快照回调函数，无法自动保存状态");
		}
	}

	/**
	 * 设置状态快照回调函数
	 */
	setStateSnapshotCallback(callback: () => any) {
		this._getStateSnapshotCallback = callback;
	}

	/**
	 * 设置状态快照更新间隔（帧数）
	 */
	setStateSnapshotInterval(frames: number) {
		this._stateSnapshotInterval = Math.max(30, frames); // 最少30帧（0.5秒）
		console.log(`[FrameSyncService] 状态快照间隔设置为: ${this._stateSnapshotInterval} 帧`);
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

	/**
	 * 暂停帧同步
	 * 定时器继续运行，但不生成和广播帧数据
	 */
	pauseSyncFrame() {
		if (!this._syncing) {
			console.warn("帧同步未启动，无法暂停");
			return;
		}
		if (this._paused) {
			console.warn("帧同步已经处于暂停状态");
			return;
		}
		this._paused = true;
		// 清空当前帧输入和追帧数据
		this._currentFrameInputs.clear();
		this._afterFrames = [];
		console.log("帧同步已暂停");
	}

	/**
	 * 恢复帧同步
	 * 继续生成和广播帧数据
	 */
	resumeSyncFrame() {
		if (!this._syncing) {
			console.warn("帧同步未启动，无法恢复");
			return;
		}
		if (!this._paused) {
			console.warn("帧同步未处于暂停状态");
			return;
		}
		this._paused = false;
		console.log("帧同步已恢复");
	}
}
