import { _decorator, Prefab } from "cc";
import { ServiceType as RoomServiceType } from "db://assets/scripts/shared/protocols/serviceProto_roomServer";
import { WsClient } from "tsrpc-browser";
import { RoomData } from "../../shared/types/RoomData";
import { UserInfo } from "../../shared/types/UserInfo";
import { GameBase } from "../GameBase";
const { ccclass, property } = _decorator;

interface Card {
	id: string;
	rank: number;
	color?: string;
	name: string;
}

const CardColor = {
	1: "♥",
	2: "♦",
	3: "♠",
	4: "♣",
};

const CardName = {
	1: "A",
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
	7: "7",
	8: "8",
	9: "9",
	10: "10",
	11: "J",
	12: "Q",
	13: "K",
	14: "小王",
	15: "大王",
};

const CardRank = {
	3: 1,
	4: 2,
	5: 3,
	6: 4,
	7: 5,
	8: 6,
	9: 7,
	10: 8,
	11: 9,
	12: 10,
	13: 11,
	1: 12,
	2: 13,
	14: 14,
	15: 15,
};

@ccclass("CardGame")
export class CardGame extends GameBase {
	@property(Prefab) cardPrefab: Prefab = null!;

	public cards: Card[] = [];
	public playerCards: { [playerId: string]: Card[] } = {};
	public lastCards: Card[] = [];

	start() {}

	public init(roomClient: WsClient<RoomServiceType>, currentRoomData: RoomData) {
		super.init(roomClient, currentRoomData);
		this.createCards();
		this.shuffleCards();
		this.dealCards(5);
		console.log(this.cards);
		console.log(this.playerCards);
	}

	public createPlayer(user: UserInfo & { color: { r: number; g: number; b: number } }, isCurrentPlayer: boolean): void {
		let playerId = user.id;
		if (isCurrentPlayer) {
			this.currentPlayerId = playerId;
		}
	}

	public createCards() {
		for (let i = 1; i <= 13; i++) {
			for (let j = 1; j <= 4; j++) {
				this.cards.push({ id: `${i}_${j}`, color: CardColor[j], name: CardName[i], rank: CardRank[i] });
			}
		}
		this.cards.push({ id: "14", name: CardName[14], rank: CardRank[14] });
		this.cards.push({ id: "15", name: CardName[15], rank: CardRank[15] });
	}

	/** 洗牌 */
	public shuffleCards() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	/** 发牌 */
	public dealCards(num: number) {
		for (let i = 0; i < num; i++) {
			for (let j = 0; j < this.currentRoomData.users.length; j++) {
				const user = this.currentRoomData.users[j];
				const card = this.cards.shift();
				if (!this.playerCards[user.id]) {
					this.playerCards[user.id] = [];
				}
				this.playerCards[user.id].push(card);
			}
		}
	}

	/** 摸牌 */
	public drawCard(playerId: string, num: number = 1) {
		for (let i = 0; i < num; i++) {
			const card = this.cards.shift();
			if (!this.playerCards[playerId]) {
				this.playerCards[playerId] = [];
			}
			this.playerCards[playerId].push(card);
		}
	}

	/** 出牌 */
	public playCard(playerId: string, cards: Card[]) {
		if (!this.playerCards[playerId]) {
			return;
		}
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			if (!this.playerCards[playerId]) {
				return;
			}
			const index = this.playerCards[playerId].indexOf(card);
			if (index !== -1) {
				this.playerCards[playerId].splice(index, 1);
			}
		}
		this.lastCards = cards;
	}

	/** 显示玩家手牌 */
	public showPlayerCards() {
		if (!this.playerCards[this.currentPlayerId]) {
			return;
		}
		const cards = this.playerCards[this.currentPlayerId];
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
		}
	}

	update(deltaTime: number) {}
}
