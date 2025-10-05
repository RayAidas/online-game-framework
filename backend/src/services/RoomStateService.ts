/**
 * 房间状态服务
 * 负责跟踪用户的房间状态
 */
export class RoomStateService {
	// 用户ID到房间ID的映射
	private static userToRoom = new Map<number, string>();

	/**
	 * 用户加入房间
	 */
	static userJoinRoom(userId: number, roomId: string) {
		this.userToRoom.set(userId, roomId);
		console.log(`用户 ${userId} 加入房间 ${roomId}`);
	}

	/**
	 * 用户离开房间
	 */
	static userLeaveRoom(userId: number) {
		const roomId = this.userToRoom.get(userId);
		if (roomId) {
			this.userToRoom.delete(userId);
			console.log(`用户 ${userId} 离开房间 ${roomId}`);
		}
	}

	/**
	 * 检查用户是否在房间中
	 */
	static isUserInRoom(userId: number): boolean {
		return this.userToRoom.has(userId);
	}

	/**
	 * 获取用户所在的房间ID
	 */
	static getUserRoomId(userId: number): string | undefined {
		return this.userToRoom.get(userId);
	}

	/**
	 * 清理房间状态（当房间被销毁时）
	 */
	static clearRoomState(roomId: string) {
		for (const [userId, userRoomId] of this.userToRoom.entries()) {
			if (userRoomId === roomId) {
				this.userToRoom.delete(userId);
				console.log(`清理用户 ${userId} 的房间状态，房间 ${roomId} 已销毁`);
			}
		}
	}
}
