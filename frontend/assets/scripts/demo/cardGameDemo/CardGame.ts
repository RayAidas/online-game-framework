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
	@property(Node) lastCardsContainer: Node = null!;

	public cards: Card[] = [];
	public playerCards: { [playerId: string]: Card[] } = {};
	public lastCards: Card[] = [];
	public currentSeatIndex: number = 0;
	public lastPlayedId: string = "";

	start() {}

	public async init(roomClient: WsClient<RoomServiceType>, currentRoomData: RoomData, firstSeatIndex: number = 0, currentUserId: string = "") {
		super.init(roomClient, currentRoomData, firstSeatIndex, currentUserId);

		// 尝试从服务端恢复游戏状态
		const restored = await this.restoreGameState();

		if (!restored) {
			// 如果没有保存的状态
			if (this.currentPlayerId === currentRoomData.ownerId) {
				// 只有房主才创建牌库、洗牌、发牌
				this.createCards();
				this.shuffleCards();
				// 先给所有玩家发5张牌
				this.dealCards(5);
				// 房主额外多发一张牌
				this.drawCard(currentRoomData.ownerId, 1);
			} else {
				// 非房主等待房主同步游戏状态
				await this.waitForGameState();
			}
		}
		this.showPlayerCards();
		this.showLastCards(); // 显示上次出的牌（如果有）

		this.currentSeatIndex = firstSeatIndex;
		// 监听回合变更消息
		this.roomClient.listenMsg("serverMsg/TurnChanged", (msg) => {
			// 更新房间数据中的回合信息
			this.currentRoomData.turnData = msg.turnData;

			// 检查是否轮到当前玩家，且上一次出牌的也是自己（无人接牌）
			const currentUser = this.currentRoomData.users.find((u) => u.id === this.currentPlayerId);
			if (currentUser && currentUser.seatIndex === msg.turnData.currentSeatIndex) {
				// 轮到自己了
				// 使用服务器传来的 lastPlayedId 判断（确保类型一致）
				const serverLastPlayedId = String(msg.turnData.lastPlayedId || "");
				const myId = String(this.currentPlayerId);
				const hasLastCards = msg.turnData.lastData && Array.isArray(msg.turnData.lastData) && msg.turnData.lastData.length > 0;

				if (serverLastPlayedId === myId && hasLastCards) {
					// 上一次出牌的也是自己，说明一圈下来没人接牌，可以摸一张牌
					if (this.cards && this.cards.length > 0) {
						this.drawCard(this.currentPlayerId, 1);
						// 刷新显示手牌
						this.showPlayerCards();
						// 清空上次出的牌（新一轮开始）
						this.lastCards = [];
						this.lastPlayedId = "";
						this.showLastCards();
					}
				} else {
					// 更新本地的 lastPlayedId 和 lastCards
					if (msg.turnData.lastPlayedId) {
						this.lastPlayedId = String(msg.turnData.lastPlayedId);
					}
					if (hasLastCards) {
						this.lastCards = msg.turnData.lastData;
						this.showLastCards();
					}
				}
			} else {
				// 不是轮到自己，只更新显示
				if (msg.turnData.lastPlayedId) {
					this.lastPlayedId = String(msg.turnData.lastPlayedId);
				}
				if (msg.turnData.lastData && msg.turnData.lastData.length > 0) {
					this.lastCards = msg.turnData.lastData;
					this.showLastCards();
				}
			}

			// 房主负责同步游戏状态到服务器（确保掉线重连时能恢复）
			if (this.currentPlayerId === this.currentRoomData.ownerId) {
				this.syncGameState();
			}
		});

		// 监听回合超时消息
		this.roomClient.listenMsg("serverMsg/TurnTimeout", (msg) => {
			// 检查是否是当前玩家的回合
			const currentUser = this.currentRoomData.users.find((u) => u.id === this.currentPlayerId);
			if (!currentUser || currentUser.seatIndex === undefined) {
				return;
			}

			// 检查是否轮到当前玩家
			if (currentUser.seatIndex !== this.currentRoomData.turnData?.currentSeatIndex) {
				return;
			}

			// 检查上一个出牌的玩家是否是当前玩家（说明一圈下来没人接牌）
			if (this.lastPlayedId === this.currentPlayerId && this.lastCards.length > 0) {
				// 自动出第一张牌
				this.autoPlayFirstCard();
			}
		});
	}

	/**
	 * 初始化回合制（由房主调用）
	 */
	public initTurnBased(firstSeatIndex: number = 0, turnTimeout: number = 30000) {
		// 检查是否是房主
		if (this.currentPlayerId !== this.currentRoomData?.ownerId) {
			return;
		}

		this.roomClient
			.callApi("InitTurn", {
				firstPlayerSeatIndex: firstSeatIndex,
				turnTimeout: turnTimeout,
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
		this.cards.push({ id: "14", tag: 14, icon: CardIcon[5], name: CardName[14], rank: CardRank[14], color: Color.BLACK });
		this.cards.push({ id: "15", tag: 15, icon: CardIcon[6], name: CardName[15], rank: CardRank[15], color: Color.RED });
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

		// 发牌后同步游戏状态到服务端
		this.syncGameState();
	}

	/** 摸牌 */
	public drawCard(playerId: string, num: number = 1) {
		for (let i = 0; i < num; i++) {
			// 检查牌库是否还有牌
			if (this.cards.length === 0) {
				console.warn("牌库已空，无法摸牌");
				break;
			}

			const card = this.cards.shift();
			if (!card) {
				break;
			}

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

		// 获取选中的牌及其对应的节点
		const selectedNodes: Node[] = [];
		const cards: Card[] = [];

		for (const child of this.cardContainer.children) {
			const cardItem = child.getComponent(CardItem);
			if (cardItem?.isSelected && cardItem.card) {
				selectedNodes.push(child);
				cards.push(cardItem.card);
			}
		}

		if (cards.length === 0) {
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

		// 销毁出牌的节点
		for (const node of selectedNodes) {
			node.destroy();
		}

		// 更新本地状态
		this.lastCards = cards;
		this.lastPlayedId = this.currentPlayerId;

		// 同步游戏状态到服务端
		this.syncGameState();

		// 检查是否获胜（手牌出完）
		const isWinner = this.checkWinner(this.currentPlayerId);
		// 如果获胜，触发游戏结束
		if (isWinner) {
			this.gameOver(this.currentPlayerId);
			return;
		}
		// 调用API结束回合，将出牌数据广播给所有玩家
		this.roomClient
			.callApi("NextTurn", {
				data: {
					lastPlayedId: this.currentPlayerId,
					lastCards: cards,
				},
			})
			.then(() => {
				// 重新排列剩余手牌
				this.showPlayerCards();
				// 显示上次出的牌
				this.showLastCards();
			})
			.catch((err) => {
				console.error("出牌失败:", err);
			});
	}

	/** 自动出第一张牌（超时且无人接牌时使用） */
	private autoPlayFirstCard() {
		// 检查回合制是否已初始化
		if (!this.currentRoomData.turnData) {
			return;
		}

		// 获取当前玩家的座位号
		const currentUser = this.currentRoomData.users.find((u) => u.id === this.currentPlayerId);
		if (!currentUser || currentUser.seatIndex === undefined) {
			return;
		}

		// 检查是否轮到当前玩家
		if (currentUser.seatIndex !== this.currentRoomData.turnData.currentSeatIndex) {
			return;
		}

		// 获取手牌
		const handCards = this.playerCards[this.currentPlayerId];
		if (!handCards || handCards.length === 0) {
			return;
		}

		// 获取排序后的第一张牌（按rank排序）
		const sortedCards = [...handCards].sort((a, b) => {
			if (a.rank !== b.rank) {
				return a.rank - b.rank;
			}
			return a.tag - b.tag;
		});

		const firstCard = sortedCards[0];

		// 检查是否是王（王不能单独出）
		if (this.isJoker(firstCard)) {
			// 如果是王，尝试找第一张非王的牌
			const nonJokerCard = sortedCards.find((c) => !this.isJoker(c));
			if (!nonJokerCard) {
				// 如果全是王，则过牌
				this.pass();
				return;
			}
			// 出第一张非王的牌
			this.playSpecificCard(nonJokerCard);
		} else {
			// 出第一张牌
			this.playSpecificCard(firstCard);
		}
	}

	/** 出指定的牌 */
	private playSpecificCard(card: Card) {
		// 检查是否是王（王不能单独出）
		if (this.isJoker(card)) {
			return;
		}

		// 检查出牌是否合法
		const cards = [card];
		if (!this.checkCardValid(cards)) {
			// 如果单张牌不合法，则过牌
			this.pass();
			return;
		}

		// 从手牌中移除这张牌
		const index = this.playerCards[this.currentPlayerId].indexOf(card);
		if (index === -1) {
			return;
		}
		this.playerCards[this.currentPlayerId].splice(index, 1);

		// 找到对应的节点并销毁
		for (const child of this.cardContainer.children) {
			const cardItem = child.getComponent(CardItem);
			if (cardItem?.card === card) {
				child.destroy();
				break;
			}
		}

		// 更新本地状态
		this.lastCards = cards;
		this.lastPlayedId = this.currentPlayerId;

		// 同步游戏状态到服务端
		this.syncGameState();

		// 检查是否获胜（手牌出完）
		const isWinner = this.checkWinner(this.currentPlayerId);
		if (isWinner) {
			this.gameOver(this.currentPlayerId);
			return;
		}

		// 调用API结束回合，将出牌数据广播给所有玩家
		this.roomClient
			.callApi("NextTurn", {
				data: {
					lastPlayedId: this.currentPlayerId,
					lastCards: cards,
				},
			})
			.then(() => {
				// 重新排列剩余手牌
				this.showPlayerCards();
				// 显示上次出的牌
				this.showLastCards();
			})
			.catch((err) => {
				console.error("自动出牌失败:", err);
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

	/** 显示上次出的牌 */
	public showLastCards() {
		// 检查容器是否存在
		if (!this.lastCardsContainer) {
			console.warn("lastCardsContainer 未设置");
			return;
		}

		// 清空容器中的旧卡牌
		this.lastCardsContainer.removeAllChildren();

		// 如果没有上次出的牌，直接返回
		if (!this.lastCards || this.lastCards.length === 0) {
			return;
		}

		// 计算卡牌间距和起始位置
		const cardWidth = 150; // 卡牌宽度
		const cardSpacing = -100; // 卡牌之间的间距（紧凑排列）
		const totalWidth = this.lastCards.length * cardWidth + (this.lastCards.length - 1) * cardSpacing;
		const startX = -totalWidth / 2 + cardWidth / 2;

		// 创建并排列卡牌
		for (let i = 0; i < this.lastCards.length; i++) {
			const card = this.lastCards[i];
			const cardNode = instantiate(this.cardPrefab);
			cardNode.parent = this.lastCardsContainer;

			// 获取CardItem组件
			let cardItem = cardNode.getComponent(CardItem);
			if (!cardItem) {
				cardItem = cardNode.addComponent(CardItem);
			}

			if (cardItem) {
				cardItem.init(card);
				// 禁用卡牌的点击和交互（这些是已出的牌，不能选择）
				cardItem.node.off(Node.EventType.TOUCH_END);
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

		// 三张及三张以上相同点数的牌（炸弹）
		if (len >= 3) {
			const uniqueRanks = Array.from(new Set(normalCards.map((c) => c.rank)));
			if (uniqueRanks.length === 1) {
				return { type: "bomb", rank: uniqueRanks[0] };
			}
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
		if (totalCards < 3) {
			return false;
		}

		// 统计每个点数的数量
		const pointCount = new Map<number, number>();
		for (const card of normalCards) {
			pointCount.set(card.tag, (pointCount.get(card.tag) || 0) + 1);
		}

		// 检查是否有重复的牌（顺子每张牌只能有1张）
		const allPoints = Array.from(pointCount.keys());
		for (let i = 0; i < allPoints.length; i++) {
			const point = allPoints[i];
			const count = pointCount.get(point) || 0;
			if (count > 1) {
				return false; // 有重复的牌，不能组成顺子
			}
		}

		// 找到所有不同的点数（按rank排序）
		const points = Array.from(pointCount.keys()).sort((a, b) => CardRank[a] - CardRank[b]);
		if (points.length === 0) {
			// 只有癞子，可以组成顺子（至少3张）
			return jokerCount >= 3;
		}

		// 转换为rank数组
		const ranks = points.map((p) => CardRank[p]).sort((a, b) => a - b);
		const minRank = ranks[0];
		const maxRank = ranks[ranks.length - 1];

		// 尝试所有可能的顺子范围
		// 顺子长度从已有牌的数量到总牌数
		for (let length = points.length; length <= totalCards && length <= 12; length++) {
			// 尝试每个可能的起始rank
			// 起始rank的范围：必须包含所有已有的牌，所以起始rank <= minRank
			// 同时要确保结束rank <= 12（A的rank）
			const maxStartRank = Math.min(minRank, 13 - length);

			for (let startRank = Math.max(1, maxRank - length + 1); startRank <= maxStartRank; startRank++) {
				let needJokers = 0;

				// 检查从startRank开始的连续length张牌
				for (let rank = startRank; rank < startRank + length; rank++) {
					const point = RankCard[rank];
					const count = pointCount.get(point) || 0;

					if (count === 0) {
						// 缺少这张牌，需要1个癞子
						needJokers++;
					}
					// count === 1 时，已经有这张牌了，不需要癞子
				}

				// 如果需要的癞子数量正好等于jokerCount，则可以组成顺子
				if (needJokers === jokerCount) {
					return true;
				}
			}
		}

		return false;
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

		// 检查是否有超过2张的牌（连对中每个点数最多2张）
		const allPoints = Array.from(pointCount.keys());
		for (let i = 0; i < allPoints.length; i++) {
			const point = allPoints[i];
			const count = pointCount.get(point) || 0;
			if (count > 2) {
				return false; // 某个点数超过2张，不能组成连对
			}
		}

		// 找到所有不同的点数（按rank排序）
		const points = Array.from(pointCount.keys()).sort((a, b) => CardRank[a] - CardRank[b]);
		if (points.length === 0) {
			// 只有癞子，可以组成连对（至少3对）
			return jokerCount >= 6;
		}

		// 转换为rank数组
		const ranks = points.map((p) => CardRank[p]).sort((a, b) => a - b);
		const minRank = ranks[0];
		const maxRank = ranks[ranks.length - 1];

		// 计算连对的长度（对数）
		const pairCount = totalCards / 2;

		// 尝试所有可能的连对范围
		for (let length = points.length; length <= pairCount && length <= 12; length++) {
			// 尝试每个可能的起始rank
			const minStartRank = Math.max(1, maxRank - length + 1);
			const maxStartRank = Math.min(minRank, 13 - length);

			for (let startRank = minStartRank; startRank <= maxStartRank; startRank++) {
				let needJokers = 0;

				// 检查从startRank开始的连续length对
				for (let rank = startRank; rank < startRank + length; rank++) {
					const point = RankCard[rank];
					const count = pointCount.get(point) || 0;

					if (count === 0) {
						// 缺少这一对，需要2个癞子
						needJokers += 2;
					} else if (count === 1) {
						// 只有1张，需要1个癞子组成一对
						needJokers += 1;
					}
					// count === 2 时，已经有完整的一对了，不需要癞子
				}

				// 如果需要的癞子数量正好等于jokerCount，则可以组成连对
				if (needJokers === jokerCount) {
					return true;
				}
			}
		}

		return false;
	}

	/** 获取连对中的最大rank */
	private getConsecutivePairRanks(normalCards: Card[], jokerCount: number): number {
		// 统计每个点数的数量
		const pointCount = new Map<number, number>();
		for (const card of normalCards) {
			pointCount.set(card.tag, (pointCount.get(card.tag) || 0) + 1);
		}

		// 找到所有不同的点数（按rank排序）
		const points = Array.from(pointCount.keys()).sort((a, b) => CardRank[a] - CardRank[b]);
		if (points.length === 0) {
			// 只有癞子，返回最大可能的rank
			return Math.min(jokerCount / 2, 12); // A的rank是12
		}

		// 转换为rank数组
		const ranks = points.map((p) => CardRank[p]).sort((a, b) => a - b);
		const minRank = ranks[0];
		const maxRank = ranks[ranks.length - 1];
		const totalCards = normalCards.length + jokerCount;
		const pairCount = totalCards / 2;

		// 找到能组成连对的最大rank
		for (let length = points.length; length <= pairCount && length <= 12; length++) {
			const minStartRank = Math.max(1, maxRank - length + 1);
			const maxStartRank = Math.min(minRank, 13 - length);

			for (let startRank = minStartRank; startRank <= maxStartRank; startRank++) {
				let needJokers = 0;

				// 检查从startRank开始的连续length对
				for (let rank = startRank; rank < startRank + length; rank++) {
					const point = RankCard[rank];
					const count = pointCount.get(point) || 0;

					if (count === 0) {
						needJokers += 2;
					} else if (count === 1) {
						needJokers += 1;
					}
				}

				// 如果需要的癞子数量正好等于jokerCount，返回这个连对的最大rank
				if (needJokers === jokerCount) {
					return startRank + length - 1;
				}
			}
		}

		// 如果找不到，返回最大rank
		return maxRank;
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
			console.error("不是你的回合");
			return false;
		}

		// 调用API结束回合（不出牌）
		// 过牌时只传空数组，后端会保持上一次出牌的信息
		this.roomClient
			.callApi("NextTurn", {
				data: {
					lastCards: [], // 空数组表示过牌
				},
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

	/**
	 * 序列化卡牌数据（将Color对象转换为可序列化的格式）
	 */
	private serializeCard(card: Card): any {
		return {
			id: card.id,
			tag: card.tag,
			rank: card.rank,
			icon: card.icon,
			name: card.name,
			selected: card.selected,
			isMove: card.isMove,
			// 将Color对象转换为RGBA值
			color: card.color
				? {
						r: card.color.r,
						g: card.color.g,
						b: card.color.b,
						a: card.color.a,
				  }
				: undefined,
		};
	}

	/**
	 * 反序列化卡牌数据（将RGBA值转换回Color对象）
	 */
	private deserializeCard(data: any): Card {
		return {
			id: data.id,
			tag: data.tag,
			rank: data.rank,
			icon: data.icon,
			name: data.name,
			selected: data.selected,
			isMove: data.isMove,
			// 将RGBA值转换回Color对象
			color: data.color ? new Color(data.color.r, data.color.g, data.color.b, data.color.a) : undefined,
		};
	}

	/**
	 * 获取当前游戏状态
	 */
	private getGameState() {
		// 序列化所有卡牌数据
		const serializedCards = this.cards.map((card) => this.serializeCard(card));
		const serializedPlayerCards: { [playerId: string]: any[] } = {};
		for (const playerId in this.playerCards) {
			if (this.playerCards.hasOwnProperty(playerId)) {
				serializedPlayerCards[playerId] = this.playerCards[playerId].map((card) => this.serializeCard(card));
			}
		}
		const serializedLastCards = this.lastCards.map((card) => this.serializeCard(card));

		return {
			cards: serializedCards,
			playerCards: serializedPlayerCards,
			lastCards: serializedLastCards,
			lastPlayedId: this.lastPlayedId,
			currentSeatIndex: this.currentSeatIndex,
		};
	}

	/**
	 * 同步游戏状态到服务端
	 */
	private syncGameState() {
		// 检查 roomClient 是否已初始化
		if (!this.roomClient) {
			console.warn("roomClient 未初始化，无法同步游戏状态");
			return;
		}

		const gameState = this.getGameState();
		this.roomClient.callApi("SyncGameState", { gameState }).catch((err) => {
			console.error("游戏状态同步失败:", err);
		});
	}

	/**
	 * 从服务端恢复游戏状态
	 * @returns true表示成功恢复，false表示没有保存的状态
	 */
	private async restoreGameState(): Promise<boolean> {
		try {
			// 检查 roomClient 是否已初始化
			if (!this.roomClient) {
				return false;
			}

			const res = await this.roomClient.callApi("GetGameState", {});

			if (res.isSucc && res.res.hasState && res.res.gameState) {
				const state = res.res.gameState;

				// 反序列化卡牌数据
				this.cards = (state.cards || []).map((data: any) => this.deserializeCard(data));

				// 反序列化玩家手牌
				this.playerCards = {};
				if (state.playerCards) {
					for (const playerId in state.playerCards) {
						if (state.playerCards.hasOwnProperty(playerId)) {
							this.playerCards[playerId] = state.playerCards[playerId].map((data: any) => this.deserializeCard(data));
						}
					}
				}

				// 反序列化上次出的牌
				this.lastCards = (state.lastCards || []).map((data: any) => this.deserializeCard(data));

				this.lastPlayedId = state.lastPlayedId || "";
				this.currentSeatIndex = state.currentSeatIndex || 0;

				return true;
			}

			return false;
		} catch (err) {
			console.error("恢复游戏状态失败:", err);
			return false;
		}
	}

	/**
	 * 等待房主同步游戏状态（非房主使用）
	 * 最多重试10次，每次间隔500ms
	 */
	private async waitForGameState(): Promise<void> {
		// 检查 roomClient 是否已初始化
		if (!this.roomClient) {
			console.error("roomClient 未初始化，无法获取游戏状态");
			return;
		}

		const maxRetries = 10;
		const retryInterval = 500; // 500ms

		for (let i = 0; i < maxRetries; i++) {
			// 等待一段时间
			await new Promise((resolve) => setTimeout(resolve, retryInterval));

			// 尝试恢复游戏状态
			const restored = await this.restoreGameState();
			if (restored) {
				return;
			}
		}

		console.error("等待游戏状态超时");
	}

	/**
	 * 组件销毁时清理
	 */
	onDestroy() {
		// 清空所有游戏数据
		this.cards = [];
		this.playerCards = {};
		this.lastCards = [];
		this.lastPlayedId = "";
		this.currentSeatIndex = 0;
	}

	update(deltaTime: number) {}
}
