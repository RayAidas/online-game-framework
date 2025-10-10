/**
 * 颜色生成工具类
 * 为游戏中的用户生成美观且易于区分的颜色
 */
export class ColorGenerator {
	/** 预定义的美观颜色调色板 */
	private static readonly PREDEFINED_COLORS = [
		{ r: 255, g: 99, b: 132 }, // 粉红色
		{ r: 54, g: 162, b: 235 }, // 蓝色
		{ r: 255, g: 206, b: 86 }, // 黄色
		{ r: 75, g: 192, b: 192 }, // 青色
		{ r: 153, g: 102, b: 255 }, // 紫色
		{ r: 255, g: 159, b: 64 }, // 橙色
		{ r: 199, g: 199, b: 199 }, // 灰色
		{ r: 83, g: 102, b: 255 }, // 靛蓝色
		{ r: 255, g: 99, b: 255 }, // 洋红色
		{ r: 99, g: 255, b: 132 }, // 绿色
		{ r: 255, g: 132, b: 99 }, // 珊瑚色
		{ r: 132, g: 99, b: 255 }, // 紫罗兰色
	];

	/** 已使用的颜色索引 */
	private static usedColorIndices = new Set<number>();

	/**
	 * 生成用户颜色
	 * 优先使用预定义颜色，如果都用完了则生成随机颜色
	 */
	static generateUserColor(): { r: number; g: number; b: number } {
		// 如果还有未使用的预定义颜色，使用预定义颜色
		if (this.usedColorIndices.size < this.PREDEFINED_COLORS.length) {
			let availableIndices = [];
			for (let i = 0; i < this.PREDEFINED_COLORS.length; i++) {
				if (!this.usedColorIndices.has(i)) {
					availableIndices.push(i);
				}
			}

			const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
			this.usedColorIndices.add(randomIndex);
			return { ...this.PREDEFINED_COLORS[randomIndex] };
		}

		// 如果预定义颜色都用完了，生成随机颜色
		return this.generateRandomColor();
	}

	/**
	 * 生成随机颜色
	 * 确保颜色不会太暗或太亮，保持可读性
	 */
	private static generateRandomColor(): { r: number; g: number; b: number } {
		// 生成HSV颜色，然后转换为RGB
		const hue = Math.random() * 360;
		const saturation = 0.7 + Math.random() * 0.3; // 70%-100% 饱和度
		const value = 0.6 + Math.random() * 0.4; // 60%-100% 亮度

		return this.hsvToRgb(hue, saturation, value);
	}

	/**
	 * HSV转RGB
	 */
	private static hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - c;

		let r = 0,
			g = 0,
			b = 0;

		if (h >= 0 && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (h >= 300 && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255),
		};
	}

	/**
	 * 释放颜色（当用户离开时）
	 */
	static releaseColor(color: { r: number; g: number; b: number }) {
		const index = this.PREDEFINED_COLORS.findIndex((c) => c.r === color.r && c.g === color.g && c.b === color.b);
		if (index !== -1) {
			this.usedColorIndices.delete(index);
		}
	}

	/**
	 * 重置颜色生成器（清空已使用颜色）
	 */
	static reset() {
		this.usedColorIndices.clear();
	}

	/**
	 * 获取已使用的颜色数量
	 */
	static getUsedColorCount(): number {
		return this.usedColorIndices.size;
	}

	/**
	 * 获取可用颜色数量
	 */
	static getAvailableColorCount(): number {
		return this.PREDEFINED_COLORS.length - this.usedColorIndices.size;
	}
}
