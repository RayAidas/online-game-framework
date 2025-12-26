import { _decorator, Component, EventTouch, Label, Node } from "cc";
import { Card } from "./type";
const { ccclass, property } = _decorator;

@ccclass("CardItem")
export class CardItem extends Component {
	@property(Label) cardName: Label = null!;
	@property(Label) cardIcon: Label = null!;
	@property(Label) smallIcon: Label = null!;

	private originalY: number = 0; // 原始Y位置
	private liftOffset: number = 50; // 上移距离
	public isSelected: boolean = false; // 是否已选中

	public card: Card = null!;

	start() {
		// 记录原始Y位置（如果还没有记录）
		if (this.originalY === 0) {
			this.originalY = this.node.position.y;
		}

		// 注册触摸事件
		this.node.on(Node.EventType.TOUCH_END, this.onCardClick, this);
	}

	onDestroy() {
		// 移除事件监听
		this.node.off(Node.EventType.TOUCH_END, this.onCardClick, this);
	}

	init(card: Card) {
		this.card = card;
		// 记录原始Y位置
		this.originalY = this.node.position.y;

		this.cardName.string = card.name;
		this.cardIcon.string = card.icon;
		this.cardName.color = this.cardIcon.color = this.smallIcon.color = card.color;
		if (card.rank === 14 || card.rank === 15) {
			this.smallIcon.string = "";
		} else {
			this.smallIcon.string = card.icon;
		}
	}

	/** 点击卡牌事件 */
	private onCardClick(event: EventTouch) {
		const currentPos = this.node.getPosition();

		if (this.isSelected) {
			// 恢复原位置
			this.node.setPosition(currentPos.x, this.originalY, currentPos.z);
			this.isSelected = false;
		} else {
			// 上移
			this.node.setPosition(currentPos.x, this.originalY + this.liftOffset, currentPos.z);
			this.isSelected = true;
		}
	}

	update(deltaTime: number) {}
}
