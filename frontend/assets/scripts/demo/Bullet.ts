import { _decorator, Color, Component, Vec3 } from "cc";
const { ccclass, property } = _decorator;

/**
 * 子弹组件
 * 处理子弹的移动、生命周期和销毁逻辑
 */
@ccclass("Bullet")
export class Bullet extends Component {
	@property({ tooltip: "子弹速度（像素/秒）" })
	speed: number = 500;
	@property({ tooltip: "子弹生命周期（秒）" })
	lifetime: number = 3;
	@property({ tooltip: "子弹颜色" })
	bulletColor: Color = Color.YELLOW;

	private direction: Vec3 = new Vec3();
	private isActive: boolean = true;

	/**
	 * 初始化子弹
	 * @param startPos 起始位置
	 * @param direction 移动方向（已标准化）
	 * @param speed 移动速度
	 * @param lifetime 生命周期
	 */
	public init(startPos: Vec3, direction: Vec3, speed?: number, lifetime?: number) {
		this.direction = direction.clone();
		this.speed = speed || this.speed;
		this.lifetime = lifetime || this.lifetime;
		this.isActive = true;

		// 设置位置
		this.node.setWorldPosition(startPos);
		console.log("Bullet: 初始化子弹", startPos);

		// 设置生命周期
		this.scheduleOnce(() => {
			this.destroyBullet();
		}, this.lifetime);
	}

	/**
	 * 更新子弹移动
	 * @param deltaTime 帧时间
	 */
	update(deltaTime: number) {
		if (!this.isActive) return;

		// 移动子弹
		const currentPos = this.node.getPosition();
		const newPos = new Vec3(
			currentPos.x + this.direction.x * this.speed * deltaTime,
			currentPos.y + this.direction.y * this.speed * deltaTime,
			currentPos.z
		);
		this.node.setPosition(newPos);
	}

	/**
	 * 销毁子弹
	 */
	public destroyBullet() {
		if (!this.isActive) return;

		this.isActive = false;
		this.node.destroy();
	}

	/**
	 * 获取子弹方向
	 */
	public getDirection(): Vec3 {
		return this.direction.clone();
	}

	/**
	 * 设置子弹方向
	 */
	public setDirection(direction: Vec3) {
		this.direction = direction.clone().normalize();
	}

	/**
	 * 获取子弹速度
	 */
	public getSpeed(): number {
		return this.speed;
	}

	/**
	 * 设置子弹速度
	 */
	public setSpeed(speed: number) {
		this.speed = speed;
	}

	/**
	 * 检查子弹是否激活
	 */
	public getIsActive(): boolean {
		return this.isActive;
	}

	/**
	 * 停止子弹移动
	 */
	public stop() {
		this.isActive = false;
	}

	/**
	 * 重新激活子弹
	 */
	public resume() {
		this.isActive = true;
	}
}
