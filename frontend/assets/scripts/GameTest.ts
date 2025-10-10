import { _decorator, Color, Component, EventKeyboard, input, Input, instantiate, KeyCode, Node, Prefab, Sprite, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameTest")
export class GameTest extends Component {
	@property(Prefab) playerPrefab: Prefab = null!;
	@property({ tooltip: "移动速度（像素/秒）" })
	moveSpeed: number = 200;
	@property({ tooltip: "移动输入发送间隔（毫秒）" })
	moveInterval: number = 50;
	@property({ tooltip: "是否限制移动边界" })
	enableBoundary: boolean = true;
	@property({ tooltip: "移动边界（像素）" })
	boundary: number = 400;

	public currentPlayer: Node = null!;
	private players: Map<string, Node> = new Map();
	private pressedKeys: Set<KeyCode> = new Set();
	private lastMoveTime: number = 0;

	start() {
		this.setupKeyboardInput();
	}

	/**
	 * 设置键盘输入监听
	 */
	private setupKeyboardInput() {
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
	}

	/**
	 * 键盘按下事件
	 */
	private onKeyDown(event: EventKeyboard) {
		// 添加按下的键到集合中
		this.pressedKeys.add(event.keyCode);
	}

	/**
	 * 键盘抬起事件
	 */
	private onKeyUp(event: EventKeyboard) {
		// 从按下的键集合中移除
		this.pressedKeys.delete(event.keyCode);
	}

	/**
	 * 发送移动输入到服务器
	 */
	private sendMoveInput(position: Vec3) {
		// 通过事件系统发送输入到RoomTest
		this.node.emit("playerMove", {
			inputType: "Move",
			x: position.x,
			y: position.y,
			timestamp: Date.now(),
		});
	}

	/**
	 * 创建玩家节点
	 */
	public createPlayer(playerId: string, isCurrentPlayer: boolean = false, color?: { r: number; g: number; b: number }): Node {
		let playerNode: Node;

		if (this.playerPrefab) {
			// 使用预制体创建玩家
			playerNode = instantiate(this.playerPrefab);
			const sprite = playerNode.getComponent(Sprite);
			if (sprite) {
				sprite.color = new Color(color.r, color.g, color.b, 255);
			}
		} else {
			// 创建简单的玩家节点
			playerNode = new Node(`Player_${playerId}`);

			// 添加精灵组件
			const sprite = playerNode.addComponent(Sprite);

			// 使用服务器生成的颜色，如果没有则使用默认颜色
			if (color) {
				sprite.color = new Color(color.r, color.g, color.b, 255);
			} else {
				sprite.color = isCurrentPlayer ? Color.RED : Color.BLUE;
			}

			// 设置玩家大小
			playerNode.setScale(0.5, 0.5, 1);
		}

		// 设置玩家位置
		playerNode.setPosition(0, 0, 0);

		// 添加到玩家容器
		this.node.addChild(playerNode);

		// 保存玩家引用
		this.players.set(playerId, playerNode);

		// 如果是当前玩家，设置为可控制的玩家
		if (isCurrentPlayer) {
			this.currentPlayer = playerNode;
		}

		return playerNode;
	}

	/**
	 * 移除玩家节点
	 */
	public removePlayer(playerId: string) {
		const playerNode = this.players.get(playerId);
		if (playerNode) {
			playerNode.destroy();
			this.players.delete(playerId);

			// 如果移除的是当前玩家，清空引用
			if (this.currentPlayer === playerNode) {
				this.currentPlayer = null;
			}
		}
	}

	/**
	 * 更新玩家位置
	 */
	public updatePlayerPosition(playerId: string, position: Vec3) {
		const playerNode = this.players.get(playerId);
		if (playerNode) {
			playerNode.setPosition(position);
			console.log(`GameTest: 更新玩家 ${playerId} 位置到 (${position.x}, ${position.y})`);
		} else {
			console.log(`GameTest: 找不到玩家 ${playerId}，当前玩家列表:`, Array.from(this.players.keys()));
		}
	}

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

	/**
	 * 停止所有移动
	 */
	public stopAllMovement() {
		this.pressedKeys.clear();
	}

	/**
	 * 设置玩家位置（不发送输入）
	 */
	public setPlayerPosition(playerId: string, position: Vec3, sendInput: boolean = false) {
		const playerNode = this.players.get(playerId);
		if (playerNode) {
			playerNode.setPosition(position);
			if (sendInput) {
				this.sendMoveInput(position);
			}
		}
	}

	/**
	 * 获取当前按下的键
	 */
	public getPressedKeys(): KeyCode[] {
		return Array.from(this.pressedKeys);
	}

	/**
	 * 检查是否正在移动
	 */
	public isMoving(): boolean {
		return this.pressedKeys.size > 0;
	}

	update(deltaTime: number) {
		// 处理长按移动
		this.handleContinuousMovement(deltaTime);
	}

	/**
	 * 处理持续移动
	 */
	private handleContinuousMovement(deltaTime: number) {
		if (!this.currentPlayer || this.pressedKeys.size === 0) return;

		const currentTime = Date.now();
		if (currentTime - this.lastMoveTime < this.moveInterval) return;

		const playerPos = this.currentPlayer.getPosition();
		let newPos = new Vec3(playerPos);
		let hasMoved = false;
		let moveDirection = "";

		// 检查所有按下的键并计算移动
		for (const keyCode of Array.from(this.pressedKeys)) {
			switch (keyCode) {
				case KeyCode.ARROW_UP:
				case KeyCode.KEY_W:
					newPos.y += this.moveSpeed * deltaTime;
					hasMoved = true;
					moveDirection += "上";
					break;
				case KeyCode.ARROW_DOWN:
				case KeyCode.KEY_S:
					newPos.y -= this.moveSpeed * deltaTime;
					hasMoved = true;
					moveDirection += "下";
					break;
				case KeyCode.ARROW_LEFT:
				case KeyCode.KEY_A:
					newPos.x -= this.moveSpeed * deltaTime;
					hasMoved = true;
					moveDirection += "左";
					break;
				case KeyCode.ARROW_RIGHT:
				case KeyCode.KEY_D:
					newPos.x += this.moveSpeed * deltaTime;
					hasMoved = true;
					moveDirection += "右";
					break;
			}
		}

		// 如果有移动，更新位置并发送输入
		if (hasMoved) {
			// 应用边界限制
			if (this.enableBoundary) {
				const oldX = newPos.x;
				const oldY = newPos.y;
				newPos.x = Math.max(-this.boundary, Math.min(this.boundary, newPos.x));
				newPos.y = Math.max(-this.boundary, Math.min(this.boundary, newPos.y));

				// 如果位置被边界限制，停止该方向的移动
				if (oldX !== newPos.x) {
					this.pressedKeys.delete(KeyCode.ARROW_LEFT);
					this.pressedKeys.delete(KeyCode.KEY_A);
					this.pressedKeys.delete(KeyCode.ARROW_RIGHT);
					this.pressedKeys.delete(KeyCode.KEY_D);
				}
				if (oldY !== newPos.y) {
					this.pressedKeys.delete(KeyCode.ARROW_UP);
					this.pressedKeys.delete(KeyCode.KEY_W);
					this.pressedKeys.delete(KeyCode.ARROW_DOWN);
					this.pressedKeys.delete(KeyCode.KEY_S);
				}
			}

			this.currentPlayer.setPosition(newPos);
			this.sendMoveInput(newPos);
			this.lastMoveTime = currentTime;

			// 调试信息（可选）
			// console.log(`玩家移动: ${moveDirection}, 位置: (${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)})`);
		}
	}

	/**
	 * 组件销毁时清理
	 */
	onDestroy() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
	}
}
