import { ConnectionInputOperate, GameSyncFrame, MsgAfterFrames, MsgInpFrame, MsgRequireSyncState, MsgSyncFrame, MsgSyncState } from "../types/FrameSync";

export interface InputHandler {
	[key: string]: (connId: string, inputFrame: ConnectionInputOperate, dt: number) => void;
}

export interface IFrameSyncConnect {
	onAfterFrames: (msg: MsgAfterFrames) => void;
	onSyncFrame: (msg: MsgSyncFrame) => void;
	onRequireSyncState: (msg: MsgRequireSyncState) => void;
	sendSyncState(msg: MsgSyncState): void;
	sendInpFrame(msg: MsgInpFrame): void;
	disconnect(): void;
}

/**
 * 客户端帧同步执行器
 * 负责接收服务端帧数据，执行输入操作，处理追帧
 */
export class FrameSyncClient {
	inputHandler: InputHandler;
	serverSyncFrameRate = 60;
	renderFrameInvMs = 1000 / this.serverSyncFrameRate;
	renderFrameDt = 1 / this.serverSyncFrameRate;
	/**追帧列表, 索引0的帧索引值 = stateFrameIndex + 1 */
	afterFrames: GameSyncFrame[] = [];
	stateData: any = null;
	/**状态同步数据是在本帧索引的数据, 即追帧是从本帧索引+1开始*/
	stateFrameIndex = -1;
	/**当前执行到的帧索引(已执行)*/
	executeFrameIndex = -1;
	/**最大可执行帧索引*/
	maxCanRenderFrameIndex = -1;
	/**执行帧已经停止*/
	executeFrameStop = true;
	/**帧同步是否暂停*/
	private _paused = false;
	executeNextFrameHandler: any;
	executeNextFrameTimerHD: any = 0;
	connect: IFrameSyncConnect;

	/**
	 * 同步状态数据回调
	 * 同时也是公开方法，允许外部调用（用于断线重连时应用服务端状态）
	 */
	public onSyncStateData: (stateData: any, stateFrameIndex: number) => void;
	public onExecFrame: (dt: number, frameIndex: number) => void;
	public getSyncState?: () => any;

	constructor(
		connect: IFrameSyncConnect,
		inputHandler: InputHandler,
		onSyncStateData: (stateData: any, stateFrameIndex: number) => void,
		onExecFrame: (dt: number, frameIndex: number) => void,
		getSyncState?: () => any
	) {
		this.connect = connect;
		this.inputHandler = inputHandler;
		this.onSyncStateData = onSyncStateData;
		this.onExecFrame = onExecFrame;
		this.getSyncState = getSyncState;

		// 设置消息监听
		this.connect.onSyncFrame = (msg: MsgSyncFrame) => {
			this.onSyncFrame(msg);
		};

		this.connect.onAfterFrames = (msg: MsgAfterFrames) => {
			this.onAfterFrames(msg);
		};

		this.connect.onRequireSyncState = (msg: MsgRequireSyncState) => {
			this.onRequireSyncState(msg);
		};
	}

	/**
	 * 开始执行帧
	 */
	startExecuteFrame() {
		if (!this.executeFrameStop) {
			return;
		}
		this.executeFrameStop = false;
		this.executeNextFrame();
	}

	/**
	 * 停止执行帧
	 */
	stopExecuteFrame() {
		this.executeFrameStop = true;
		if (this.executeNextFrameTimerHD) {
			clearTimeout(this.executeNextFrameTimerHD);
			this.executeNextFrameTimerHD = 0;
		}
	}

	/**
	 * 发送输入帧
	 */
	sendInputFrame(inputFrame: ConnectionInputOperate) {
		const msg: MsgInpFrame = {
			operates: [inputFrame],
		};
		this.connect.sendInpFrame(msg);
	}

	/**
	 * 处理同步帧消息
	 */
	private onSyncFrame(msg: MsgSyncFrame) {
		// 如果暂停，不处理新帧
		if (this._paused) {
			return;
		}

		// 添加到追帧列表
		this.afterFrames.push(msg.syncFrame);
		this.maxCanRenderFrameIndex = msg.frameIndex;

		// 如果帧同步已停止，重新开始
		if (this.executeFrameStop) {
			this.startExecuteFrame();
		}
	}

	/**
	 * 处理追帧消息
	 * 公开方法，允许外部调用（用于断线重连）
	 */
	public onAfterFrames(msg: MsgAfterFrames) {
		// 清空当前追帧列表
		this.afterFrames = [];

		// 添加追帧数据
		this.afterFrames = msg.afterFrames;
		this.maxCanRenderFrameIndex = msg.startFrameIndex + msg.afterFrames.length - 1;

		// 更新执行帧索引
		this.executeFrameIndex = msg.startFrameIndex - 1;

		console.log(`[FrameSyncClient] 接收追帧数据: ${msg.afterFrames.length} 帧, 起始帧索引: ${msg.startFrameIndex}`);

		// 开始执行帧
		this.startExecuteFrame();
	}

	/**
	 * 处理状态同步请求
	 */
	private onRequireSyncState(msg: MsgRequireSyncState) {
		if (this.getSyncState) {
			const stateData = this.getSyncState();
			const syncStateMsg: MsgSyncState = {
				stateData: stateData,
				stateFrameIndex: this.executeFrameIndex,
			};
			this.connect.sendSyncState(syncStateMsg);
		}
	}

	/**
	 * 执行下一帧
	 */
	private executeNextFrame() {
		if (this.executeFrameStop) {
			return;
		}

		// 如果暂停，不执行帧，但继续定时检查
		if (this._paused) {
			this.executeNextFrameTimerHD = setTimeout(() => {
				this.executeNextFrame();
			}, this.renderFrameInvMs);
			return;
		}

		// 检查是否有可执行的帧
		if (this.executeFrameIndex >= this.maxCanRenderFrameIndex) {
			// 没有更多帧可执行，等待下一帧
			this.executeNextFrameTimerHD = setTimeout(() => {
				this.executeNextFrame();
			}, this.renderFrameInvMs);
			return;
		}

		// 执行当前帧
		this.executeFrameIndex++;
		const frameIndex = this.executeFrameIndex;
		const afterFrameIndex = frameIndex - this.stateFrameIndex - 1;

		if (afterFrameIndex >= 0 && afterFrameIndex < this.afterFrames.length) {
			const frame = this.afterFrames[afterFrameIndex];
			this.executeFrame(frame, frameIndex);
		}

		// 继续执行下一帧
		this.executeNextFrameTimerHD = setTimeout(() => {
			this.executeNextFrame();
		}, this.renderFrameInvMs);
	}

	/**
	 * 执行帧
	 */
	private executeFrame(frame: GameSyncFrame, frameIndex: number) {
		// 执行所有连接的输入
		for (const connectionInput of frame.connectionInputs) {
			for (const operate of connectionInput.operates) {
				this.executeInput(connectionInput.connectionId, operate, frameIndex);
			}
		}

		// 调用帧执行回调
		this.onExecFrame(this.renderFrameDt, frameIndex);
	}

	/**
	 * 执行输入
	 */
	private executeInput(connId: string, inputFrame: ConnectionInputOperate, frameIndex: number) {
		// 根据输入类型调用对应的处理函数
		const inputType = inputFrame.inputType;
		if (inputType && this.inputHandler[`execInput_${inputType}`]) {
			this.inputHandler[`execInput_${inputType}`](connId, inputFrame, this.renderFrameDt);
		}
	}

	/**
	 * 请求状态同步
	 */
	requestSyncState(frameIndex: number) {
		const msg: MsgRequireSyncState = {
			frameIndex: frameIndex,
		};
		this.connect.onRequireSyncState(msg);
	}

	/**
	 * 构建追帧消息
	 */
	buildAfterFramesMsg(): MsgAfterFrames {
		return {
			afterFrames: this.afterFrames,
			startFrameIndex: this.stateFrameIndex + 1,
		};
	}

	/**
	 * 暂停帧同步
	 * 暂停后不接收新帧，不执行帧逻辑
	 */
	pauseFrameSync() {
		if (this._paused) {
			console.warn("FrameSyncClient: 帧同步已经处于暂停状态");
			return;
		}
		this._paused = true;
		console.log("FrameSyncClient: 帧同步已暂停");
	}

	/**
	 * 恢复帧同步
	 * 继续接收和执行帧
	 */
	resumeFrameSync() {
		if (!this._paused) {
			console.warn("FrameSyncClient: 帧同步未处于暂停状态");
			return;
		}
		this._paused = false;
		console.log("FrameSyncClient: 帧同步已恢复");

		// 如果帧同步已停止，重新开始
		if (this.executeFrameStop && this.afterFrames.length > 0) {
			this.startExecuteFrame();
		}
	}

	/**
	 * 检查是否暂停
	 */
	isPaused(): boolean {
		return this._paused;
	}
}
