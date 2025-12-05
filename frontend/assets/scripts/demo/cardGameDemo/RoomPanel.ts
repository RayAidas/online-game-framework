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
		game.lastCards = msg.turnData.lastData || [];
		game.lastPlayedId = msg.turnData.lastPlayedId || "";
	}

	public handleTurnTimeout(msg: any) {
		console.log("回合超时:", msg);
	}

	update(deltaTime: number) {}
}
