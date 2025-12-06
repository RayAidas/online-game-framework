import { _decorator, Color, instantiate, Node, Prefab } from "cc";
import { ServiceType as RoomServiceType } from "db://assets/scripts/shared/protocols/serviceProto_roomServer";
import { WsClient } from "tsrpc-browser";
import { RoomData } from "../../shared/types/RoomData";
import { UserInfo } from "../../shared/types/UserInfo";
import { GameBase } from "../GameBase";
import { CardItem } from "./CardItem";
import { CardIcon, CardName, CardRank, RankCard } from "./Common";
import { Card } from "./type";
const { ccclass, property } = _decorator;

@ccclass("CardGame")
export class CardGame extends GameBase {
	@property(Prefab) cardPrefab: Prefab = null!;
	@property(Node) cardContainer: Node = null!;

	public cards: Card[] = [];
	public playerCards: { [playerId: string]: Card[] } = {};
	public lastCards: Card[] = [];
	public currentSeatIndex: number = 0;
	public lastPlayedId: string = "";

	start() {}

	public init(roomClient: WsClient<RoomServiceType>, currentRoomData: RoomData, firstSeatIndex: number = 0, currentUserId: string = "") {
		super.init(roomClient, currentRoomData, firstSeatIndex, currentUserId);

		console.log("初始化 CardGame, currentPlayerId:", this.currentPlayerId);

		this.createCards();
		this.shuffleCards();
		this.dealCards(5);
		this.showPlayerCards();
		this.currentSeatIndex = firstSeatIndex;
		// 监听回合变更消息
		this.roomClient.listenMsg("serverMsg/TurnChanged", (msg) => {
			console.log("[TurnChanged]", msg);
			// 更新房间数据中的回合信息
			this.currentRoomData.turnData = msg.turnData;
			// 更新上一次出牌的数据
			if (msg.turnData.lastData) {
				this.lastCards = msg.turnData.lastData;
			}
			if (msg.turnData.lastPlayedId) {
				this.lastPlayedId = msg.turnData.lastPlayedId;
			}
			// 可以在这里添加UI更新逻辑
			console.log(`当前回合: 第${msg.turnData.turnNumber}回合, 座位号: ${msg.turnData.currentSeatIndex}`);
			if (msg.currentPlayer) {
				console.log(`当前玩家: ${msg.currentPlayer.nickname}`);
			}
		});

		// 监听回合超时消息
		this.roomClient.listenMsg("serverMsg/TurnTimeout", (msg) => {
			console.log("[TurnTimeout] 回合超时");
		});
	}

	/**
	 * 初始化回合制（由房主调用）
	 */
	public initTurnBased(firstSeatIndex: number = 0, turnTimeout: number = 30000) {
		console.log("准备初始化回合制...", this.currentPlayerId, this.currentRoomData?.ownerId);

		// 检查是否是房主
		if (this.currentPlayerId !== this.currentRoomData?.ownerId) {
			console.log("不是房主，无需初始化回合制");
			return;
		}

		console.log("房主初始化回合制");
		this.roomClient
			.callApi("InitTurn", {
				firstPlayerSeatIndex: firstSeatIndex,
				turnTimeout: turnTimeout,
			})
			.then((res) => {
				console.log("回合制初始化成功", res);
			})
			.catch((err) => {
				console.error("回合制初始化失败:", err);
			});
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
				this.cards.push({ id: `${i}_${j}`, tag: i, icon: CardIcon[j], name: CardName[i], rank: CardRank[i], color: j > 2 ? Color.BLACK : Color.RED });
			}
		}
		this.cards.push({ id: "14", tag: 14,icon: CardIcon[5], name: CardName[14], rank: CardRank[14], color: Color.BLACK });
		this.cards.push({ id: "15", tag: 15,icon: CardIcon[6], name: CardName[15], rank: CardRank[15], color: Color.RED });
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

	public playCard() {
		// 检查回合制是否已初始化
		if (!this.currentRoomData.turnData) {
			console.error("回合制未初始化，请等待游戏开始");
			return;
		}

		// 获取当前玩家的座位号
		const currentUser = this.currentRoomData.users.find((u) => u.id === this.currentPlayerId);
		if (!currentUser || currentUser.seatIndex === undefined) {
			console.error("无法获取当前玩家的座位号");
			return;
		}

		// 检查是否轮到当前玩家
		if (currentUser.seatIndex !== this.currentRoomData.turnData.currentSeatIndex) {
			console.error(`不是你的回合！当前回合座位号: ${this.currentRoomData.turnData.currentSeatIndex}, 你的座位号: ${currentUser.seatIndex}`);
			return;
		}

		// 获取选中的牌
		const cards = this.playerCards[this.currentPlayerId]?.filter((card) => card.selected);
		if (!cards || cards.length === 0) {
			console.error("请选择要出的牌");
			return;
		}

		// 检查出牌是否合法
		if (!this.checkCardValid(cards)) {
			console.error("出牌不合法");
			return;
		}

		// 从手牌中移除出的牌
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			const index = this.playerCards[this.currentPlayerId].indexOf(card);
			if (index !== -1) {
				this.playerCards[this.currentPlayerId].splice(index, 1);
			}
		}
		// 更新本地状态
		this.lastCards = cards;
		this.lastPlayedId = this.currentPlayerId;

		console.log(`出牌成功: ${cards.map((c) => c.name).join(", ")}`);

		// 调用API结束回合
		this.roomClient
			.callApi("NextTurn", {
				data: {
					lastPlayedId: this.currentPlayerId,
					lastCards: cards,
				},
			})
			.then(() => {
				console.log("回合结束成功");
			})
			.catch((err) => {
				console.error("回合结束失败:", err);
			});
	}

	/** 显示玩家手牌 */
	public showPlayerCards() {
		if (!this.playerCards[this.currentPlayerId]) {
			return;
		}

		// 清空容器中的旧卡牌
		this.cardContainer.removeAllChildren();

		// 获取并排序手牌
		const cards = this.playerCards[this.currentPlayerId];
		const sortedCards = [...cards].sort((a, b) => {
			// 先按rank排序，rank相同则按tag排序
			if (a.rank !== b.rank) {
				return a.rank - b.rank;
			}
			return a.tag - b.tag;
		});

		// 计算卡牌间距和起始位置
		const cardWidth = 150; // 卡牌宽度（与prefab中的宽度一致）
		const cardSpacing = -100; // 卡牌之间的间距（紧凑排列）
		const totalWidth = sortedCards.length * cardWidth + (sortedCards.length - 1) * cardSpacing;
		const startX = -totalWidth / 2 + cardWidth / 2;

		// 创建并排列卡牌
		for (let i = 0; i < sortedCards.length; i++) {
			const card = sortedCards[i];
			const cardNode = instantiate(this.cardPrefab);
			cardNode.parent = this.cardContainer;

			// 检查并获取CardItem组件
			let cardItem = cardNode.getComponent(CardItem);
			if (!cardItem) {
				// 如果组件不存在，尝试添加
				cardItem = cardNode.addComponent(CardItem);
				console.warn("CardItem组件不存在，已自动添加");
			}

			if (cardItem) {
				cardItem.init(card);
			}

			// 设置卡牌位置，按顺序排列
			const x = startX + i * (cardWidth + cardSpacing);
			cardNode.setPosition(x, 0, 0);
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
		// 检查回合制是否已初始化
		if (!this.currentRoomData.turnData) {
			console.error("回合制未初始化");
			return false;
		}

		// 检查是否轮到当前玩家
		if (!this.isMyTurn()) {
			console.error("不是你的回合，无法过牌");
			return false;
		}

		console.log("过牌");

		// 调用API结束回合（不出牌）
		this.roomClient
			.callApi("NextTurn", {
				data: {
					lastPlayedId: this.currentPlayerId,
					lastCards: [], // 空数组表示过牌
				},
			})
			.then(() => {
				console.log("过牌成功");
			})
			.catch((err) => {
				console.error("过牌失败:", err);
			});

		return true;
	}

	/** 检查是否轮到当前玩家 */
	public isMyTurn(): boolean {
		if (!this.currentRoomData.turnData) {
			return false;
		}
		const currentUser = this.currentRoomData.users.find((u) => u.id === this.currentPlayerId);
		if (!currentUser || currentUser.seatIndex === undefined) {
			return false;
		}
		return currentUser.seatIndex === this.currentRoomData.turnData.currentSeatIndex;
	}

	update(deltaTime: number) {}
}
