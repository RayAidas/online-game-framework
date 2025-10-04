import bcrypt from "bcryptjs";

/**
 * 密码加密服务
 * 负责用户密码的加密、验证和安全管理
 */
export class PasswordService {
	// 加密强度，数值越高越安全但越慢
	private static readonly SALT_ROUNDS = 12;

	/**
	 * 加密密码
	 * @param plainPassword 明文密码
	 * @returns 加密后的密码哈希
	 */
	static async hashPassword(plainPassword: string): Promise<string> {
		try {
			const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(plainPassword, salt);
			return hashedPassword;
		} catch (error) {
			console.error("密码加密失败:", error);
			throw new Error("密码加密失败");
		}
	}

	/**
	 * 验证密码
	 * @param plainPassword 明文密码
	 * @param hashedPassword 加密后的密码哈希
	 * @returns 密码是否匹配
	 */
	static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
		try {
			return await bcrypt.compare(plainPassword, hashedPassword);
		} catch (error) {
			console.error("密码验证失败:", error);
			return false;
		}
	}

	/**
	 * 检查密码强度
	 * @param password 密码
	 * @returns 密码强度信息
	 */
	static checkPasswordStrength(password: string): {
		isValid: boolean;
		score: number;
		message: string;
		requirements: {
			length: boolean;
			hasUppercase: boolean;
			hasLowercase: boolean;
			hasNumbers: boolean;
			hasSpecialChars: boolean;
		};
	} {
		const requirements = {
			length: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumbers: /\d/.test(password),
			hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
		};

		const score = Object.values(requirements).filter(Boolean).length;
		const isValid = score >= 4; // 至少满足4个要求

		let message = "";
		if (isValid) {
			message = "密码强度良好";
		} else {
			const missing = [];
			if (!requirements.length) missing.push("至少8位字符");
			if (!requirements.hasUppercase) missing.push("包含大写字母");
			if (!requirements.hasLowercase) missing.push("包含小写字母");
			if (!requirements.hasNumbers) missing.push("包含数字");
			if (!requirements.hasSpecialChars) missing.push("包含特殊字符");
			message = `密码强度不足，需要：${missing.join("、")}`;
		}

		return {
			isValid,
			score,
			message,
			requirements,
		};
	}

	/**
	 * 生成随机密码
	 * @param length 密码长度，默认12位
	 * @returns 随机密码
	 */
	static generateRandomPassword(length: number = 12): string {
		const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";

		// 确保至少包含一个大写字母、小写字母、数字和特殊字符
		password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
		password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
		password += "0123456789"[Math.floor(Math.random() * 10)];
		password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

		// 填充剩余长度
		for (let i = 4; i < length; i++) {
			password += charset[Math.floor(Math.random() * charset.length)];
		}

		// 打乱字符顺序
		return password
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");
	}

	/**
	 * 验证密码是否符合安全策略
	 * @param password 密码
	 * @returns 验证结果
	 */
	static validatePasswordPolicy(password: string): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push("密码长度至少8位");
		}

		if (password.length > 128) {
			errors.push("密码长度不能超过128位");
		}

		if (!/[A-Z]/.test(password)) {
			errors.push("密码必须包含至少一个大写字母");
		}

		if (!/[a-z]/.test(password)) {
			errors.push("密码必须包含至少一个小写字母");
		}

		if (!/\d/.test(password)) {
			errors.push("密码必须包含至少一个数字");
		}

		// 检查常见弱密码
		const commonPasswords = ["password", "123456", "123456789", "qwerty", "abc123", "password123", "admin", "root", "user", "test"];

		if (commonPasswords.includes(password.toLowerCase())) {
			errors.push("不能使用常见弱密码");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
