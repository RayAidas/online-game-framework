import { _decorator, Color, EventKeyboard, EventMouse, input, Input, instantiate, KeyCode, Node, Prefab, screen, Sprite, Vec2, Vec3 } from "cc";
import * as _uuid from "uuid";
import { UserInfo } from "../shared/types/UserInfo";
import { getDistance } from "../util";
import { Bullet } from "./Bullet";
import { GameBase } from "./GameBase";
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
export class GameDemo extends GameBase {
	@property(Prefab) playerPrefab: Prefab = null!;
	@property(Prefab) bulletPrefab: Prefab = null!;
	@property({ tooltip: "移动速度（像素/秒）" }) moveSpeed: number = 200;
	@property({ tooltip: "移动输入发送间隔（毫秒）" }) moveInterval: number = 50;
	@property({ tooltip: "子弹速度（像素/秒）" }) bulletSpeed: number = 500;
	@property({ tooltip: "子弹生命周期（秒）" }) bulletLifetime: number = 3;

	private pressedKeys: Set<KeyCode> = new Set();
	private lastMoveTime: number = 0;
	private bullets: Node[] = [];
	private lastStateReportTime: number = 0;
	private stateReportInterval: number = 100; // 每100ms上报一次游戏状态

	start() {
		this.setupKeyboardInput();
		this.setupNodeClick();
		this.setupWindowFocusListener();
	}

	/**
	 * 设置键盘输入监听
	 */
	private setupKeyboardInput() {
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
	}

	/**
	 * 窗口失去焦点时清空按键状态
	 */
	onWindowBlur() {
		console.log("GameDemo: 窗口失去焦点，清空按键状态");
		this.pressedKeys.clear();
	}

	/**
	 * 窗口获得焦点
	 */
	onWindowFocus() {
		console.log("GameDemo: 窗口获得焦点");
		// 不需要做特殊处理，用户重新按键时会自动添加
	}

	/**
	 * 页面可见性变化
	 */
	onVisibilityChange() {
		if (document.hidden) {
			console.log("GameDemo: 页面隐藏，清空按键状态");
			this.pressedKeys.clear();
		} else {
			console.log("GameDemo: 页面显示");
		}
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
		if (this.isGameOver) return;
		if (event.getButton() === EventMouse.BUTTON_LEFT) {
			this.fireBullet(event);
		}
	}

	/**
	 * 键盘按下事件
	 */
	private onKeyDown(event: EventKeyboard) {
		if (this.isGameOver) return;
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

		let bulletId = _uuid.v4();
		// 创建子弹
		this.createBullet(this.currentPlayerId, playerPos, direction, bulletId);

		// 发送子弹输入到服务器
		this.sendBulletInput(mousePos, bulletId);
	}

	/**
	 * 创建子弹
	 */
	public createBullet(playerId: string, startPos: Vec3, direction: Vec3, uuid: string) {
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
			bulletComponent.init(playerId, startPos, direction, uuid, this.bulletSpeed, this.bulletLifetime);
		}

		// 添加到场景

		// 保存子弹引用
		this.bullets.push(bulletNode);
	}

	/**
	 * 生成玩家子弹
	 */
	public createPlayerBullet(playerId: string, touchPos: Vec3, bulletId: string) {
		let playerNode = this.players.get(playerId);
		if (playerNode) {
			// 计算子弹方向：从玩家位置指向鼠标点击位置
			let targetX = screen.windowSize.width - touchPos.x;
			let targetY = screen.windowSize.height - touchPos.y;
			const direction = new Vec3(targetX - playerNode.getPosition().x, targetY - playerNode.getPosition().y, 0).normalize();
			this.createBullet(playerId, playerNode.getWorldPosition(), direction, bulletId);
		}
	}

	/**
	 * 创建玩家节点
	 */
	public createPlayer(user: UserInfo & { color: { r: number; g: number; b: number } }, isCurrentPlayer: boolean = false, initialPosition?: Vec3): Node {
		console.log("创建玩家节点:", user);
		let playerNode: Node;
		let playerId = user.id;
		let color = user.color;
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

		// 设置初始位置
		let position: Vec3;
		if (initialPosition) {
			// 如果提供了初始位置（重连时从服务器状态恢复），使用该位置
			// 注意：initialPosition 是普通对象 { x, y, z }，需要转换为 Vec3
			position = new Vec3(initialPosition.x, initialPosition.y, initialPosition.z || 0);
			console.log(`玩家 ${playerId} 使用服务器位置: (${position.x}, ${position.y})`);
		} else {
			// 否则使用默认初始位置
			position = new Vec3(0, -200, 0);
		}

		// 应用位置（对于其他玩家需要坐标转换）
		// 注意：position 是服务器坐标，需要转换为显示坐标
		if (!isCurrentPlayer) {
			const transformedPos = this.transformPositionForDisplay(playerId, position);
			playerNode.setPosition(transformedPos);
			console.log(`其他玩家 ${playerId} 位置转换: 服务器(${position.x}, ${position.y}) -> 显示(${transformedPos.x}, ${transformedPos.y})`);
		} else {
			playerNode.setPosition(position);
			console.log(`当前玩家 ${playerId} 位置: (${position.x}, ${position.y})`);
		}

		// 添加到玩家容器
		this.node.addChild(playerNode);

		// 保存玩家引用
		this.players.set(playerId, playerNode);
		this.playerInfos[this.playerIndex].init(user.id, user.nickname, color);
		this.playerIndex++;

		// 如果是当前玩家，设置为可控制的玩家
		if (isCurrentPlayer) {
			this.currentPlayer = playerNode;
			this.currentPlayerId = playerId;
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
	 * 应用服务器状态数据（重连时使用）
	 * @param userStates 服务器保存的所有玩家状态
	 */
	public applyServerState(userStates: any) {
		if (!userStates) {
			console.log("没有服务器状态数据可应用");
			return;
		}

		console.log("应用服务器状态数据:", userStates);

		// 更新所有玩家的位置和血量
		Object.keys(userStates).forEach((playerId) => {
			const state = userStates[playerId];

			// 更新玩家位置
			if (state.x !== undefined && state.y !== undefined) {
				const playerNode = this.players.get(playerId);
				if (playerNode) {
					const serverPosition = new Vec3(state.x, state.y, 0);
					// 应用坐标转换
					const displayPosition = this.transformPositionForDisplay(playerId, serverPosition);
					playerNode.setPosition(displayPosition);
					console.log(`玩家 ${playerId} 位置已更新: (${state.x}, ${state.y})`);
				}
			}

			// 更新玩家血量
			if (state.hp !== undefined) {
				const playerInfo = this.playerInfos.find((info) => info.playerId === playerId);
				if (playerInfo) {
					const hpDiff = state.hp - playerInfo.hp;
					playerInfo.updateHp(hpDiff);
					console.log(`玩家 ${playerId} 血量已更新: ${state.hp}`);
				}
			}
		});

		console.log("服务器状态应用完成");
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
	 * @param position 服务器坐标（原始位置）
	 * @returns 转换后的显示坐标
	 */
	private transformPositionForDisplay(playerId: string, position: Vec3): Vec3 {
		// 如果这是当前玩家，直接返回原位置（当前玩家在下方）
		// 使用 playerId 比较更可靠，避免对象引用问题
		if (playerId === this.currentPlayerId) {
			return position.clone();
		}

		// 对于其他玩家，将Y坐标转换到屏幕上方
		// 服务器坐标：所有玩家的真实位置在下方（Y < 0）
		// 客户端显示：
		//   - 当前玩家：直接使用服务器坐标（Y < 0，在下方）
		//   - 其他玩家：镜像转换（Y > 0，在上方）
		// 转换规则：Y_display = -Y_server + 200，X_display = -X_server
		// 例如：服务器 (-100, -200) → 显示 (100, 400)
		const displayX = -position.x;
		const displayY = -position.y + 200;

		return new Vec3(displayX, displayY, position.z);
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

	/**
	 * 玩家被被击中
	 * @param playerId 被击中的玩家ID
	 */
	public beHit(playerId: string, bulletId?: string) {
		if (this.isGameOver) return;
		let playerInfo = this.playerInfos.find((info) => info.playerId === playerId);
		if (playerInfo) {
			playerInfo.updateHp(-10);
			this.reportGameState();
			if (playerInfo.hp <= 0) {
				console.log("玩家被击中,游戏结束:", playerId);
				this.gameOver(playerId);
			}
		}
		if (bulletId) {
			let bullet = this.bullets.find((bullet) => bullet.getComponent(Bullet)?.bulletId === bulletId);
			if (bullet) bullet.getComponent(Bullet)?.destroyBullet();
		}
	}

	public showOverPanel(playerId?: string) {
		this.overPanel.active = true;
		if (playerId === this.currentPlayerId) this.overLabel.string = "你输了";
		else this.overLabel.string = "你赢了";
	}

	update(deltaTime: number) {
		// 处理长按移动
		this.handleContinuousMovement(deltaTime);

		// 处理子弹移动
		this.updateBullets(deltaTime);

		// 定期上报游戏状态到服务器（关键：包含所有玩家的状态）
		this.reportGameState();
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

		// 改为检测自己的子弹是否击中其他玩家（重要：确保掉线玩家也能被击中）
		this.bullets
			.filter((e) => e.getComponent(Bullet)?.ownerId === this.currentPlayerId)
			.forEach((e) => {
				let bullet = e.getComponent(Bullet);
				// 检测是否击中其他玩家
				this.players.forEach((playerNode, playerId) => {
					// 跳过自己
					if (playerId === this.currentPlayerId) return;

					// 检测碰撞
					if (getDistance(bullet.node.getPosition(), playerNode.getPosition()) < 50) {
						bullet.destroyBullet();
						// 本地立即更新被击中玩家的血量
						this.beHit(playerId, bullet.bulletId);
						// 发送"玩家X被击中"的帧数据（而不是"我受伤"）
						this.sendPlayerBeHitInput(playerId, bullet.bulletId);
					}
				});
			});
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

	backHome() {
		this.overPanel.active = false;
		super.backHome();
		this.roomClient.callApi("ExitGame", {});
	}

	/**
	 * 组件销毁时清理
	 */
	onDestroy() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

		// 清理节点事件
		this.node.off(Node.EventType.MOUSE_DOWN, this.onNodeMouseDown, this);

		// 清理窗口事件监听
		if (this.boundOnWindowBlur) {
			window.removeEventListener("blur", this.boundOnWindowBlur);
		}
		if (this.boundOnWindowFocus) {
			window.removeEventListener("focus", this.boundOnWindowFocus);
		}
		if (this.boundOnVisibilityChange) {
			document.removeEventListener("visibilitychange", this.boundOnVisibilityChange);
		}

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

	/**
	 * 定期上报游戏状态到服务器
	 * 重要：每个在线玩家都会上报自己看到的所有玩家状态
	 * 服务器会合并多个客户端的状态数据，确保掉线玩家的状态也能被记录
	 */
	private reportGameState() {
		const currentTime = Date.now();
		if (currentTime - this.lastStateReportTime < this.stateReportInterval) {
			return;
		}

		if (!this.roomClient || this.isGameOver) {
			return;
		}

		// 收集所有玩家的状态（包括掉线玩家）
		const allPlayersState: any = {};

		this.playerInfos.forEach((playerInfo) => {
			if (playerInfo.playerId) {
				const playerNode = this.players.get(playerInfo.playerId);
				if (playerNode) {
					const pos = playerNode.getPosition();
					allPlayersState[playerInfo.playerId] = {
						id: this.currentPlayerId,
						hp: playerInfo.hp,
						x: pos.x,
						y: pos.y,
						timestamp: currentTime,
					};
				}
			}
		});

		// 发送消息到服务器
		this.roomClient.sendMsg("clientMsg/UserState", {
			states: allPlayersState,
		});

		this.lastStateReportTime = currentTime;
	}

	/** -------------------事件发送------------------- */
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
	 * 发送子弹输入到服务器
	 */
	private sendBulletInput(touchPos: Vec2 | Vec3, bulletId: string) {
		// 通过事件系统发送子弹输入到RoomPanel
		this.node.emit("playerInput", {
			inputType: "Fire",
			x: touchPos.x,
			y: touchPos.y,
			timestamp: Date.now(),
			bulletId: bulletId,
		});
	}

	/**
	 * 发送玩家被击中事件到服务器
	 */
	private sendPlayerBeHitInput(playerId: string, bulletId: string) {
		console.log("Input:", "behit");
		this.node.emit("playerInput", {
			inputType: "BeHit",
			playerId: playerId,
			bulletId: bulletId,
			timestamp: Date.now(),
		});
	}

	/** -------------------处理帧同步------------------- */

	/**
	 * 同步帧数据
	 */
	public syncFrame(connectionInput: any, operate: any) {
		if (operate.inputType === "Move") {
			// 更新其他玩家位置
			this.updatePlayerPosition(connectionInput.connectionId, new Vec3(operate.x, operate.y, 0));
		}
		if (operate.inputType === "Fire") {
			// 创建子弹
			this.createPlayerBullet(connectionInput.connectionId, new Vec3(operate.x, operate.y, 0), operate.bulletId);
		}
		if (operate.inputType === "BeHit") {
			// operate.playerId 是被击中的玩家ID（由发射子弹的玩家发送）
			// connectionInput.connectionId 是发射子弹的玩家ID
			console.log(`玩家 ${operate.playerId} 被玩家 ${connectionInput.connectionId} 击中`);
			this.beHit(operate.playerId, operate.bulletId);
		}
	}
}
