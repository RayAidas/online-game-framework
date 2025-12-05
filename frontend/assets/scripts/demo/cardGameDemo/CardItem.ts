import { _decorator, Color, Component, Label } from "cc";
import { Card } from "./type";
const { ccclass, property } = _decorator;

@ccclass("CardItem")
export class CardItem extends Component {
	@property(Label) cardName: Label = null!;
	@property(Label) cardIcon: Label = null!;

	start() {}

	init(card: Card) {
		this.cardName.string = card.name;
		this.cardIcon.string = card.icon;
		this.cardName.color = card.color;
		this.cardIcon.color = card.color;
	}

	update(deltaTime: number) {}
}
