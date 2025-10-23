import { HttpClient } from "tsrpc";
import { redisClient } from "../models/Database";
import { serviceProto as serviceProto_matchServer } from "../shared/protocols/serviceProto_matchServer";
import { UserInfo } from "../shared/types/UserInfo";
import { RoomStateService } from "./RoomStateService";
import { GamePhase } from "../shared/types/GamePhase";

/**
 * Redis房间状态服务
 * 负责持久化用户的房间状态，支持断线重连
 */
export class RedisRoomStateService {
	// Redis key前缀
	private static readonly USER_ROOM_PREFIX = "user_room:";
	private static readonly ROOM_USERS_PREFIX = "room_users:";
	// 默认超时时间：30分钟
	private static readonly DEFAULT_TTL = 30 * 60; // 秒

	/**
	 * 用户加入房间
	 * @param userId 用户ID
	 * @param roomId 房间ID
	 * @param userInfo 用户信息（昵称、颜色等）
	 * @param ttl 过期时间（秒），默认30分钟
	 */
	static async userJoinRoom(userId: number, roomId: string, userInfo: any, ttl: number = this.DEFAULT_TTL) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const roomKey = `${this.ROOM_USERS_PREFIX}${roomId}`;

			// 存储用户->房间的映射
			const userData = {
				roomId,
				...userInfo,
				joinTime: Date.now(),
				lastActiveTime: Date.now(),
			};
			await redisClient.setEx(userKey, ttl, JSON.stringify(userData));

			// 存储房间->用户列表的映射（使用Set）
			await redisClient.sAdd(roomKey, userId.toString());
			await redisClient.expire(roomKey, ttl);

			console.log(`[Redis] 用户 ${userId} 加入房间 ${roomId}`);
		} catch (error) {
			console.error(`[Redis] 用户加入房间失败:`, error);
		}
	}

	/**
	 * 更新用户最后活跃时间
	 * @param userId 用户ID
	 */
	static async updateUserActiveTime(userId: number) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);

			if (userData) {
				const data = JSON.parse(userData);
				data.lastActiveTime = Date.now();

				// 获取剩余TTL
				const ttl = await redisClient.ttl(userKey);
				if (ttl > 0) {
					await redisClient.setEx(userKey, ttl, JSON.stringify(data));
				}
			}
		} catch (error) {
			console.error(`[Redis] 更新用户活跃时间失败:`, error);
		}
	}

	/**
	 * 用户离开房间
	 * @param userId 用户ID
	 */
	static async userLeaveRoom(userId: number) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);

			if (userData) {
				const data = JSON.parse(userData);
				const roomKey = `${this.ROOM_USERS_PREFIX}${data.roomId}`;

				// 从房间用户列表中移除
				await redisClient.sRem(roomKey, userId.toString());

				// 删除用户房间映射
				await redisClient.del(userKey);

				// 同时清除内存中的 RoomStateService 状态（仅清除当前进程）
				RoomStateService.userLeaveRoom(userId);

				// 通知 MatchServer 清除用户房间状态（跨进程通信）
				try {
					const matchClient = new HttpClient(serviceProto_matchServer, {
						server: "http://127.0.0.1:3004",
						logger: console,
					});

					const result = await matchClient.callApi("ClearUserRoomState", {
						userId: userId,
					});

					if (!result.isSucc) {
						console.error(`[Redis] 通知 MatchServer 清除用户 ${userId} 状态失败:`, result.err);
					} else {
						console.log(`[Redis] 成功通知 MatchServer 清除用户 ${userId} 的状态`);
					}
				} catch (err) {
					console.error("[Redis] 通知 MatchServer 异常:", err);
				}

				console.log(`[Redis] 用户 ${userId} 离开房间 ${data.roomId}（已同步清除所有服务状态）`);
			}
		} catch (error) {
			console.error(`[Redis] 用户离开房间失败:`, error);
		}
	}

	/**
	 * 检查用户是否在房间中
	 * @param userId 用户ID
	 */
	static async isUserInRoom(userId: number): Promise<boolean> {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const exists = await redisClient.exists(userKey);
			return exists === 1;
		} catch (error) {
			console.error(`[Redis] 检查用户房间状态失败:`, error);
			return false;
		}
	}

	/**
	 * 获取用户所在的房间信息
	 * @param userId 用户ID
	 */
	static async getUserRoomInfo(userId: number): Promise<any | null> {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);

			if (userData) {
				return JSON.parse(userData);
			}
			return null;
		} catch (error) {
			console.error(`[Redis] 获取用户房间信息失败:`, error);
			return null;
		}
	}

	/**
	 * 获取房间中的所有用户ID
	 * @param roomId 房间ID
	 */
	static async getRoomUsers(roomId: string): Promise<number[]> {
		try {
			const roomKey = `${this.ROOM_USERS_PREFIX}${roomId}`;
			const userIds = await redisClient.sMembers(roomKey);
			return userIds.map((id) => parseInt(id));
		} catch (error) {
			console.error(`[Redis] 获取房间用户列表失败:`, error);
			return [];
		}
	}

	/**
	 * 清理房间状态（当房间被销毁时）
	 * @param roomId 房间ID
	 */
	static async clearRoomState(roomId: string) {
		try {
			const roomKey = `${this.ROOM_USERS_PREFIX}${roomId}`;
			const userIds = await redisClient.sMembers(roomKey);

			// 删除所有用户的房间映射
			for (const userId of userIds) {
				const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
				await redisClient.del(userKey);
			}

			// 删除房间用户列表
			await redisClient.del(roomKey);

			// 同时清除内存中的 RoomStateService 状态
			RoomStateService.clearRoomState(roomId);

			console.log(`[Redis] 清理房间 ${roomId} 的状态，移除 ${userIds.length} 个用户（已同步清除内存状态）`);
		} catch (error) {
			console.error(`[Redis] 清理房间状态失败:`, error);
		}
	}

	/**
	 * 标记用户为离线状态（断线但不退出房间）
	 * @param userId 用户ID
	 */
	static async markUserOffline(userId: number) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);

			if (userData) {
				const data = JSON.parse(userData);
				data.isOffline = true;
				data.offlineTime = Date.now();

				// 获取剩余TTL
				const ttl = await redisClient.ttl(userKey);
				if (ttl > 0) {
					await redisClient.setEx(userKey, ttl, JSON.stringify(data));
				}

				console.log(`[Redis] 标记用户 ${userId} 为离线状态`);
			}
		} catch (error) {
			console.error(`[Redis] 标记用户离线失败:`, error);
		}
	}

	/**
	 * 标记用户为在线状态（重连）
	 * @param userId 用户ID
	 */
	static async markUserOnline(userId: number) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);

			if (userData) {
				const data = JSON.parse(userData);
				data.isOffline = false;
				data.onlineTime = Date.now();
				data.lastActiveTime = Date.now();
				delete data.offlineTime;

				// 刷新TTL
				await redisClient.setEx(userKey, this.DEFAULT_TTL, JSON.stringify(data));

				console.log(`[Redis] 标记用户 ${userId} 为在线状态`);
			}
		} catch (error) {
			console.error(`[Redis] 标记用户在线失败:`, error);
		}
	}

	static async updateUserGamePhase(userId: number, gamePhase: GamePhase) {
		try {
			const userKey = `${this.USER_ROOM_PREFIX}${userId}`;
			const userData = await redisClient.get(userKey);
			if (userData) {
				const data = JSON.parse(userData);
				data.gamePhase = gamePhase;
				await redisClient.setEx(userKey, this.DEFAULT_TTL, JSON.stringify(data));
			}
		} catch (error) {
			console.error(`[Redis] 更新用户游戏阶段失败:`, error);
		}
	}

	/**
	 * 清理超时的离线用户
	 * @param timeoutMs 超时时间（毫秒），默认5分钟
	 */
	static async cleanTimeoutOfflineUsers(timeoutMs: number = 5 * 60 * 1000) {
		try {
			// 这个方法需要扫描所有用户键，实际生产环境中应该使用定时任务
			const keys = await redisClient.keys(`${this.USER_ROOM_PREFIX}*`);
			let cleanedCount = 0;

			for (const key of keys) {
				const userData = await redisClient.get(key);
				if (userData) {
					const data = JSON.parse(userData);
					if (data.isOffline && data.offlineTime) {
						const offlineTime = Date.now() - data.offlineTime;
						if (offlineTime > timeoutMs) {
							// 超时，清理用户
							const userId = parseInt(key.replace(this.USER_ROOM_PREFIX, ""));
							await this.userLeaveRoom(userId);
							cleanedCount++;
						}
					}
				}
			}

			if (cleanedCount > 0) {
				console.log(`[Redis] 清理了 ${cleanedCount} 个超时离线用户`);
			}
		} catch (error) {
			console.error(`[Redis] 清理超时离线用户失败:`, error);
		}
	}
}
