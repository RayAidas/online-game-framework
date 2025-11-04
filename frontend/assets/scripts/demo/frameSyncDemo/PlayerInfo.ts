import { _decorator, Color, Component, Label, ProgressBar, Sprite } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerInfo")
export class PlayerInfo extends Component {
	@property(Sprite) avatar: Sprite = null!;
	@property(Label) nickname: Label = null!;
	@property(ProgressBar) hpBar: ProgressBar = null!;
	@property(Label) hpLabel: Label = null!;

	public readonly maxHp: number = 100;
	public hp: number = 100;
	public playerId: string = "";

	start() {}

	init(playerId: string, nickname: string, color: { r: number; g: number; b: number }) {
		this.playerId = playerId;
		this.nickname.string = nickname;
		this.hp = this.maxHp;
		this.hpBar.progress = this.hp / this.maxHp;
		this.nickname.color = new Color(color.r, color.g, color.b, 255);
	}

	updateHp(hp: number) {
		this.hp += hp;
		this.hpBar.progress = this.hp / this.maxHp;
		this.hpLabel.string = `${this.hp}/${this.maxHp}`;
	}

	update(deltaTime: number) {}
}
