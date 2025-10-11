import { _decorator, Color, Component, EventKeyboard, EventMouse, input, Input, instantiate, KeyCode, Node, Prefab, screen, Sprite, Vec2, Vec3 } from "cc";
import { Bullet } from "./Bullet";
const { ccclass, property } = _decorator;

/**
 * 游戏演示组件
 *
 * 同步机制说明：
 * 1. 每个客户端看到的自己控制的角色在屏幕下方
 * 2. 每个客户端看到的其他玩家的角色在屏幕上方
 * 3. 通过坐标转换实现每个客户端都有"自己在下，敌人在上"的视角
 *
 * 坐标系统：
 * - 服务器坐标：所有玩家都在下方区域（Y < 0）
 * - 当前玩家：直接使用服务器坐标（Y < 0，在下方）
 * - 其他玩家：通过坐标转换 Y = -position.y + 200（Y > 0，在上方）
 * - 初始位置：所有玩家都从 Y = -200 开始，其他玩家立即转换到上方
 */
@ccclass("GameDemo")
export class GameDemo extends Component {
	@property(Prefab) playerPrefab: Prefab = null!;
	@property(Prefab) bulletPrefab: Prefab = null!;
	@property({ tooltip: "移动速度（像素/秒）" })
	moveSpeed: number = 200;
	@property({ tooltip: "移动输入发送间隔（毫秒）" })
	moveInterval: number = 50;
	@property({ tooltip: "子弹速度（像素/秒）" })
	bulletSpeed: number = 500;
	@property({ tooltip: "子弹生命周期（秒）" })
	bulletLifetime: number = 3;

	public currentPlayer: Node = null!;
	private players: Map<string, Node> = new Map();
	private pressedKeys: Set<KeyCode> = new Set();
	private lastMoveTime: number = 0;
	private bullets: Node[] = [];

	start() {
		this.setupKeyboardInput();
		this.setupNodeClick();
	}

	/**
	 * 设置键盘输入监听
	 */
	private setupKeyboardInput() {
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
	}

	/**
	 * 设置节点点击事件
	 */
	private setupNodeClick() {
		// 监听节点点击事件
		this.node.on(Node.EventType.MOUSE_DOWN, this.onNodeMouseDown, this);
	}

	/**
	 * 节点鼠标按下事件
	 */
	private onNodeMouseDown(event: EventMouse) {
		if (event.getButton() === EventMouse.BUTTON_LEFT) {
			this.fireBullet(event);
		}
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
		// 通过事件系统发送输入到RoomPanel
		this.node.emit("playerInput", {
			inputType: "Move",
			x: position.x,
			y: position.y,
			timestamp: Date.now(),
		});
	}

	/**
	 * 发射子弹
	 */
	private fireBullet(event: EventMouse) {
		if (!this.currentPlayer) {
			console.warn("GameDemo: 无法发射子弹 - 当前玩家未设置");
			return;
		}

		// 获取鼠标点击的屏幕坐标
		const mousePos = event.getUILocation();

		// 获取当前玩家位置
		const playerPos = this.currentPlayer.getWorldPosition();

		// 计算子弹方向：从玩家位置指向鼠标点击位置
		const direction = new Vec3(mousePos.x - playerPos.x, mousePos.y - playerPos.y, 0).normalize();

		// 创建子弹
		this.createBullet(playerPos, direction);

		// 发送子弹输入到服务器
		this.sendBulletInput(mousePos);
	}

	/**
	 * 创建子弹
	 */
	public createBullet(startPos: Vec3, direction: Vec3) {
		// 使用 Bullet 组件创建子弹
		const bulletNode = instantiate(this.bulletPrefab);

		// 计算子弹旋转角度（让子弹朝向移动方向）
		const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI - 90;
		bulletNode.setRotationFromEuler(0, 0, angle);

		// 获取子弹组件并初始化
		const bulletComponent = bulletNode.getComponent(Bullet);
		this.node.addChild(bulletNode);
		if (bulletComponent) {
			// 初始化子弹：设置起始位置、方向、速度、生命周期
			bulletComponent.init(startPos, direction, this.bulletSpeed, this.bulletLifetime);
		}

		// 添加到场景

		// 保存子弹引用
		this.bullets.push(bulletNode);
	}

	/**
	 * 生成玩家子弹
	 */
	public createPlayerBullet(playerId: string, touchPos: Vec3) {
		let playerNode = this.players.get(playerId);
		if (playerNode) {
			// 计算子弹方向：从玩家位置指向鼠标点击位置
			let targetX = screen.windowSize.width - touchPos.x;
			let targetY = screen.windowSize.height - touchPos.y;
			const direction = new Vec3(targetX - playerNode.getPosition().x, targetY - playerNode.getPosition().y, 0).normalize();
			this.createBullet(playerNode.getWorldPosition(), direction);
		}
	}

	/**
	 * 发送子弹输入到服务器
	 */
	private sendBulletInput(touchPos: Vec2 | Vec3) {
		// 通过事件系统发送子弹输入到RoomPanel
		this.node.emit("playerInput", {
			inputType: "Fire",
			x: touchPos.x,
			y: touchPos.y,
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

		// 根据是否为当前玩家设置初始位置
		// 所有玩家都从下方开始，其他玩家通过坐标转换显示在上方
		const initialY = -200; // 所有玩家都从下方开始
		playerNode.setPosition(0, initialY, 0);

		// 如果不是当前玩家，立即应用坐标转换显示在上方
		if (!isCurrentPlayer) {
			const transformedPos = this.transformPositionForDisplay(playerId, new Vec3(0, initialY, 0));
			playerNode.setPosition(transformedPos);
		}

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
			// 应用坐标转换：每个客户端看到的其他玩家都在上方
			const transformedPosition = this.transformPositionForDisplay(playerId, position);
			playerNode.setPosition(transformedPosition);
		}
	}

	/**
	 * 坐标转换：确保每个客户端看到的其他玩家都在屏幕上方
	 * @param playerId 玩家ID
	 * @param position 原始位置
	 * @returns 转换后的位置
	 */
	private transformPositionForDisplay(playerId: string, position: Vec3): Vec3 {
		// 如果这是当前玩家，直接返回原位置（当前玩家在下方）
		if (this.currentPlayer && this.players.get(playerId) === this.currentPlayer) {
			return position;
		}

		// 对于其他玩家，将Y坐标转换到屏幕上方
		// 服务器坐标：当前玩家的真实位置在下方（Y < 0）
		// 客户端显示：其他玩家在上方（Y > 0）
		// 转换规则：将下方坐标转换为上方坐标，保持与初始位置一致
		let displayY = position.y;

		// 将下方坐标转换为上方坐标
		// 使用简单的镜像转换：Y = -position.y + 200
		// 这样 -200 变成 400，-100 变成 300，-300 变成 500
		displayY = -position.y + 200;

		return new Vec3(-position.x, displayY, position.z);
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

		// 处理子弹移动
		this.updateBullets(deltaTime);
	}

	/**
	 * 更新子弹移动
	 */
	private updateBullets(deltaTime: number) {
		// 清理无效的子弹引用
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			if (!bullet || !bullet.isValid) {
				this.bullets.splice(i, 1);
			}
		}
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
			this.currentPlayer.setPosition(newPos);
			this.sendMoveInput(newPos);
			this.lastMoveTime = currentTime;
		}
	}

	/**
	 * 组件销毁时清理
	 */
	onDestroy() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

		// 清理节点事件
		this.node.off(Node.EventType.MOUSE_DOWN, this.onNodeMouseDown, this);

		// 清理所有子弹
		this.bullets.forEach((bullet) => {
			if (bullet && bullet.isValid) {
				const bulletComponent = bullet.getComponent(Bullet);
				if (bulletComponent) {
					bulletComponent.destroyBullet();
				} else {
					bullet.destroy();
				}
			}
		});
		this.bullets = [];
	}
}
