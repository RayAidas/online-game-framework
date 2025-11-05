import { _decorator, Prefab } from "cc";
import { ServiceType as RoomServiceType } from "db://assets/scripts/shared/protocols/serviceProto_roomServer";
import { WsClient } from "tsrpc-browser";
import { RoomData } from "../../shared/types/RoomData";
import { UserInfo } from "../../shared/types/UserInfo";
import { GameBase } from "../GameBase";
const { ccclass, property } = _decorator;

interface Card {
	id: string;
	tag: number;
	rank: number;
	color?: string;
	name: string;
	selected?: boolean;
	isMove?: boolean;
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

const RankCard = {
	1: 3,
	2: 4,
	3: 5,
	4: 6,
	5: 7,
	6: 8,
	7: 9,
	8: 10,
	9: 11,
	10: 12,
	11: 13,
	12: 1,
	13: 2,
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
				this.cards.push({ id: `${i}_${j}`, tag: i, color: CardColor[j], name: CardName[i], rank: CardRank[i] });
			}
		}
		this.cards.push({ id: "14", tag: 14, name: CardName[14], rank: CardRank[14] });
		this.cards.push({ id: "15", tag: 15, name: CardName[15], rank: CardRank[15] });
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

	/** 检查出牌是否合法 */
	public checkCardValid(cards: Card[]) {
		if (!cards || cards.length === 0) {
			return false;
		}

		// 如果是第一次出牌，任何合法牌型都可以
		if (this.lastCards.length === 0) {
			return this.isValidCardType(cards);
		}

		// 获取当前牌型和上次牌型
		const currentType = this.getCardType(cards);
		const lastType = this.getCardType(this.lastCards);

		if (!currentType || !lastType) {
			return false;
		}

		// 炸弹可以压任何牌型
		if (currentType.type === "bomb") {
			if (lastType.type !== "bomb") {
				return true;
			}
			// 炸弹vs炸弹，比较数量和大小
			if (cards.length > this.lastCards.length) {
				return true;
			}
			if (cards.length === this.lastCards.length) {
				return currentType.rank > lastType.rank;
			}
			return false;
		}

		// 非炸弹不能压炸弹
		if (lastType.type === "bomb") {
			return false;
		}

		// 相同牌型才能比较
		if (currentType.type !== lastType.type || cards.length !== this.lastCards.length) {
			return false;
		}

		// 比较牌力
		if (currentType.rank >= CardRank[2] && currentType.rank > lastType.rank) return true;
		return currentType.rank === lastType.rank + 1;
	}

	/** 判断是否为合法牌型 */
	private isValidCardType(cards: Card[]): boolean {
		const type = this.getCardType(cards);
		return type !== null;
	}

	/** 判断是否为王（癞子） */
	private isJoker(card: Card): boolean {
		return card.rank === 14 || card.rank === 15; // 小王和大王
	}

	/** 获取牌型 */
	private getCardType(cards: Card[]): { type: string; rank: number } | null {
		if (!cards || cards.length === 0) {
			return null;
		}

		const len = cards.length;
		const jokers = cards.filter((c) => this.isJoker(c));
		const normalCards = cards.filter((c) => !this.isJoker(c));

		// 单张：不能是王
		if (len === 1) {
			if (this.isJoker(cards[0])) {
				return null; // 王不能单独出
			}
			return { type: "single", rank: cards[0].rank };
		}

		// 对子
		if (len === 2) {
			// 不能是两个王
			if (jokers.length === 2) {
				return null;
			}
			// 一个王+一张普通牌，算作对子
			if (jokers.length === 1 && normalCards.length === 1) {
				return { type: "pair", rank: normalCards[0].rank };
			}
			// 两张普通牌必须相同
			if (normalCards.length === 2 && normalCards[0].rank === normalCards[1].rank) {
				return { type: "pair", rank: normalCards[0].rank };
			}
			return null;
		}

		// 三张及三张以上相同点数的牌
		if (len >= 3) {
			const uniqueRanks = Array.from(new Set(normalCards.map((c) => c.rank)));
			if (uniqueRanks.length === 1) {
				return { type: "bomb", rank: uniqueRanks[0] };
			}
			return null;
		}

		// 顺子（至少3张连续的牌）
		if (len >= 3) {
			// 顺子不能包含2
			const has2 = cards.some((c) => c.rank === 13);
			if (has2) {
				return null;
			}

			const sortedNormalCards = [...normalCards].sort((a, b) => a.rank - b.rank);

			// 尝试用王填补顺子
			if (this.canFormStraight(sortedNormalCards, jokers.length)) {
				return { type: "straight", rank: this.getMaxRankInStraight(sortedNormalCards, jokers.length) };
			}
		}

		// 连对（至少3对连续的对子）
		if (len >= 6 && len % 2 === 0) {
			// 连对不能包含2
			const has2 = cards.some((c) => c.rank === 13);
			if (has2) {
				return null;
			}

			if (this.canFormConsecutivePairs(normalCards, jokers.length)) {
				const rank = this.getConsecutivePairRanks(normalCards, jokers.length);
				return { type: "consecutivePairs", rank: rank };
			}
		}

		return null;
	}

	/** 检查是否能组成顺子 */
	private canFormStraight(normalCards: Card[], jokerCount: number): boolean {
		const totalCards = normalCards.length + jokerCount;
		if (normalCards.length + jokerCount < 3) {
			return false;
		}

		// 统计每个点数的数量
		const pointCount = new Map<number, number>();
		for (const card of normalCards) {
			pointCount.set(card.tag, (pointCount.get(card.tag) || 0) + 1);
		}

		// 找到最小和最大点数
		const points = Array.from(pointCount.keys()).sort((a, b) => CardRank[a] - CardRank[b]);
		if (points.length === 0) {
			return false;
		}

		let needJokers = 0;
		let minPoint = points[0];
		let maxPoint = points[points.length - 1];

		if (minPoint == 3) maxPoint = RankCard[CardRank[3] + totalCards / 2 - 1];
		if (maxPoint == 1) minPoint = RankCard[CardRank[1] - totalCards / 2 + 1];

		for (let i = minPoint; i <= maxPoint; i++) {
			const count = pointCount.get(i) || 0;
			if (count === 0) {
				needJokers += 2;
			} else if (count == 1) {
				needJokers++;
			} else if (count > 2) {
				return false; // 有重复的牌，不能组成顺子
			}
		}
		return needJokers === jokerCount;
	}

	/** 获取顺子中的最大rank */
	private getMaxRankInStraight(normalCards: Card[], jokerCount: number): number {
		let sort = normalCards.sort((a, b) => a.rank - b.rank);
		if (sort[sort.length - 1].rank - sort[0].rank + 1 === sort.length + jokerCount) {
			return sort[sort.length - 1].rank;
		} else {
			return Math.min(sort[sort.length - 1].rank + jokerCount, CardRank[1]);
		}
	}

	/** 检查是否能组成连对 */
	private canFormConsecutivePairs(normalCards: Card[], jokerCount: number): boolean {
		const totalCards = normalCards.length + jokerCount;
		if (totalCards < 6 || totalCards % 2 !== 0) {
			return false;
		}

		// 统计每个点数的数量
		const pointCount = new Map<number, number>();
		for (const card of normalCards) {
			pointCount.set(card.tag, (pointCount.get(card.tag) || 0) + 1);
		}

		// 找到最小和最大点数
		const points = Array.from(pointCount.keys()).sort((a, b) => CardRank[a] - CardRank[b]);
		if (points.length === 0) {
			return false;
		}

		let needJokers = 0;
		let minPoint = points[0];
		let maxPoint = points[points.length - 1];

		if (minPoint == 3) maxPoint = RankCard[CardRank[3] + totalCards - 1];
		if (maxPoint == 1) minPoint = RankCard[CardRank[1] - totalCards + 1];

		for (let i = minPoint; i <= maxPoint; i++) {
			const count = pointCount.get(i) || 0;
			if (count === 0) {
				needJokers++;
			} else if (count > 1) {
				return false; // 有重复的牌，不能组成顺子
			}
		}
		return needJokers === jokerCount;
	}

	/** 获取连对中的最大rank */
	private getConsecutivePairRanks(normalCards: Card[], jokerCount: number): number {
		let sort = normalCards.sort((a, b) => a.rank - b.rank);
		if (sort[sort.length - 1].rank - sort[0].rank + 1 === (sort.length + jokerCount) / 2) {
			return sort[sort.length - 1].rank;
		} else {
			return Math.min(sort[sort.length - 1].rank + jokerCount / 2, CardRank[1]);
		}
	}

	/** 对手牌进行排序 */
	public sortPlayerCards(playerId: string) {
		if (!this.playerCards[playerId]) {
			return;
		}
		this.playerCards[playerId].sort((a, b) => a.rank - b.rank);
	}

	/** 检查玩家是否赢了 */
	public checkWinner(playerId: string): boolean {
		return this.playerCards[playerId] && this.playerCards[playerId].length === 0;
	}

	/** 过牌 */
	public pass() {
		// 玩家选择不出牌
		return true;
	}

	update(deltaTime: number) {}
}
