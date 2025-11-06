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
		this.game.init(this.roomClient, this.currentRoomData, this.firstPlayerSeatIndex);
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
		}
	}

	public handleTurnChanged(msg: any) {
		console.log("回合变更:", msg);
		this.game as CardGame;
	}

	public handleTurnTimeout(msg: any) {
		console.log("回合超时:", msg);
	}

	update(deltaTime: number) {}
}
