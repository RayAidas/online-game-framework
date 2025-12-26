import { _decorator, instantiate } from "cc";
import { RoomBase } from "../RoomBase";
import { CardGame } from "./CardGame";
const { ccclass, property } = _decorator;

@ccclass("RoomPanel")
export class RoomPanel extends RoomBase {
	public isFrameSync: boolean = false;
	public firstPlayerSeatIndex: number = 0;

	start() {}

	public setupEventListeners() {
		super.setupEventListeners();
		this.roomClient.listenMsg("serverMsg/TurnChanged", (msg) => {
			this.handleTurnChanged(msg);
		});
		this.roomClient.listenMsg("serverMsg/TurnTimeout", (msg) => {
			this.handleTurnTimeout(msg);
		});
	}

	public handleGameStarted(msg: any) {
		// 清除之前的游戏实例（如果存在）
		if (this.game && this.game.node && this.game.node.isValid) {
			console.log("[HandleGameStarted] 清除旧游戏实例");
			this.game.node.removeFromParent();
			this.game.node.destroy();
			this.game = null;
		}

		// 清除服务端的游戏状态（开始新游戏）
		this.clearServerGameState();

		let gameNode = instantiate(this.gamePrefab);
		this.game = gameNode.getComponent(CardGame);
		// 传入当前用户ID，以便在init中初始化currentPlayerId
		const currentUserId = this.currentUser ? this.currentUser.id : "";
		this.game.init(this.roomClient, this.currentRoomData, this.firstPlayerSeatIndex, currentUserId);
		this.node.parent.addChild(gameNode);
		this.callSetReady(false);
		if (this.game) {
			// 为房间内所有用户创建玩家节点
			if (this.currentRoomData && this.currentUser) {
				this.currentRoomData.users.forEach((user) => {
					const isCurrentPlayer = user.id === this.currentUser!.id;
					this.game.createPlayer(user, isCurrentPlayer);
				});
			}

			// 所有玩家创建完成后，初始化回合制
			const cardGame = this.game as CardGame;
			cardGame.initTurnBased(this.firstPlayerSeatIndex, 30000); // 30秒超时
		}
	}

	public handleTurnChanged(msg: any) {
		console.log("回合变更:", msg);
		let game = this.game as CardGame;
		if (!game) return;
		game.lastCards = msg.turnData.lastData || [];
		game.lastPlayedId = msg.turnData.lastPlayedId || "";
	}

	public handleTurnTimeout(msg: any) {
		console.log("回合超时:", msg);
	}

	/**
	 * 处理游戏结束
	 */
	public handleGameOver(msg: any) {
		console.log("游戏结束:", msg);
		super.handleGameOver(msg);

		// 游戏结束后清除服务端游戏状态
		this.clearServerGameState();
	}

	/**
	 * 清除服务端的游戏状态
	 */
	private clearServerGameState() {
		console.log("[ClearGameState] 清除服务端游戏状态");
		this.roomClient
			.callApi("SyncGameState", { gameState: null })
			.then(() => {
				console.log("[ClearGameState] 游戏状态已清除");
			})
			.catch((err) => {
				console.error("[ClearGameState] 清除失败:", err);
			});
	}

	/**
	 * 重连恢复游戏
	 */
	public async rejoinGame(): Promise<void> {
		console.log("[RejoinGame] 开始恢复游戏状态");

		if (!this.game) {
			let gameNode = instantiate(this.gamePrefab);
			this.game = gameNode.getComponent(CardGame);
			// 传入当前用户ID，以便在init中初始化currentPlayerId
			const currentUserId = this.currentUser ? this.currentUser.id : "";
			this.game.init(this.roomClient, this.currentRoomData, this.firstPlayerSeatIndex, currentUserId);
			this.node.parent.addChild(gameNode);
			if (this.game) {
				// 为房间内所有用户创建玩家节点
				if (this.currentRoomData && this.currentUser) {
					this.currentRoomData.users.forEach((user) => {
						const isCurrentPlayer = user.id === this.currentUser!.id;
						this.game.createPlayer(user, isCurrentPlayer);
					});
				}
			}
		}
	}

	/**
	 * 组件销毁时清理
	 */
	onDestroy() {
		console.log("[RoomPanel] 组件销毁，清除游戏状态");
		// 清除游戏实例
		if (this.game && this.game.node && this.game.node.isValid) {
			this.game.node.removeFromParent();
			this.game.node.destroy();
			this.game = null;
		}
	}

	update(deltaTime: number) {}
}
