import { _decorator, Component, Label, Node } from "cc";
import { UserInfo } from "../shared/types/UserInfo";
import { PlayerInfo } from "./PlayerInfo";
const { ccclass, property } = _decorator;

@ccclass("GameBase")
export class GameBase extends Component {
	@property([PlayerInfo]) playerInfos: PlayerInfo[] = [];
	@property(Node) overPanel: Node = null!;
	@property(Label) overLabel: Label = null!;

	public currentPlayer: Node = null!;
	public currentPlayerId: string = "";
	public players: Map<string, Node> = new Map();
	public playerIndex: number = 0;

	// 保存绑定后的函数引用，用于正确清理事件监听
	public boundOnWindowBlur: () => void = null!;
	public boundOnWindowFocus: () => void = null!;
	public boundOnVisibilityChange: () => void = null!;

	start() {}

	public init(data?: {
		[key: string]: any;
	}) {}

	/**
	 * 设置窗口焦点监听
	 */
	public setupWindowFocusListener() {
		// 保存绑定后的函数引用
		this.boundOnWindowBlur = this.onWindowBlur.bind(this);
		this.boundOnWindowFocus = this.onWindowFocus.bind(this);
		this.boundOnVisibilityChange = this.onVisibilityChange.bind(this);

		// 监听窗口失去焦点事件
		window.addEventListener("blur", this.boundOnWindowBlur);
		// 监听窗口获得焦点事件
		window.addEventListener("focus", this.boundOnWindowFocus);
		// 监听页面可见性变化
		document.addEventListener("visibilitychange", this.boundOnVisibilityChange);
	}

	public onWindowBlur() {}

	public onWindowFocus() {}

	public onVisibilityChange() {}

	public createPlayer(user: UserInfo & { color: { r: number; g: number; b: number } }, isCurrentPlayer: boolean = false) {}

	public removePlayer(playerId: string) {}

	public syncFrame(connectionInput: any, operate: any) {}

	/**
	 * 设置当前玩家
	 */
	public setCurrentPlayer(playerId: string) {
		const playerNode = this.players.get(playerId);
		if (playerNode) {
			this.currentPlayer = playerNode;
		}
	}

	/**
	 * 获取所有玩家
	 */
	public getPlayers(): Map<string, Node> {
		return this.players;
	}

	public backHome() {
		this.node.removeFromParent();
		this.node.destroy();
	}

	update(deltaTime: number) {}
}
