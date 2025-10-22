import { WsServer } from "tsrpc";
import { roomServer } from "../../../roomServer";
import { RedisRoomStateService } from "../../../services/RedisRoomStateService";
import { GamePhase } from "../../../shared/types/GamePhase";
import { RoomServerConn } from "../../RoomServer";

/** MatchServer 断开后清理 */
export function useCleanConn(server: WsServer<any>) {
	server.flows.postDisconnectFlow.push(async (v) => {
		let conn = v.conn as RoomServerConn;

		// 处理用户断线
		if (conn.currentRoom && conn.currentUser) {
			const userId = parseInt(conn.currentUser.id);
			if (!isNaN(userId)) {
				const room = conn.currentRoom;
				const isOnlyUser = room.data.users.length === 1;

				if (isOnlyUser) {
					// 房间只有一个人，直接退出房间并清理所有状态
					console.log(`用户 ${userId} (${conn.currentUser.nickname}) 断线，房间内只有一人，直接退出房间`);

					// 完全清理：Redis + 内存 + 通知 MatchServer
					await RedisRoomStateService.userLeaveRoom(userId);

					// 调用 leave 清理房间内部状态
					room.leave(conn);
				} else {
					// 房间有多人，标记为离线状态，保留在房间中
					await RedisRoomStateService.markUserOffline(userId);
					console.log(`用户 ${userId} (${conn.currentUser.nickname}) 断线，标记为离线状态，房间还有 ${room.data.users.length - 1} 人`);

					// 在房间数据中标记用户为离线
					const userInRoom = room.data.users.find((u) => u.id === conn.currentUser.id);
					if (userInRoom) {
						userInRoom.isOffline = true;

						// 如果在准备阶段掉线，自动取消准备状态
						if (room.data.gamePhase === GamePhase.WAITING && userInRoom.isReady) {
							userInRoom.isReady = false;
							console.log(`用户 ${userId} (${conn.currentUser.nickname}) 在准备阶段掉线，已自动取消准备状态`);

							// 广播准备状态变化，让其他玩家看到
							room.broadcastMsg("serverMsg/UserReadyChanged", {
								time: new Date(),
								user: conn.currentUser,
								isReady: false,
							});
						}
					}

					room.broadcastMsg("serverMsg/UserOffline", {
						time: new Date(),
						user: conn.currentUser,
					});

					// 从连接列表中移除，但不调用leave（保留房间数据）
					room.conns.removeOne((v) => v === conn);
					conn.currentRoom = undefined;
				}
			}
		}

		// MatchServer 清空定时器
		if (conn.matchServer) {
			clearInterval(conn.matchServer.intervalSendState);
			if (roomServer.matchServerConn === conn) {
				roomServer.matchServerConn = undefined;
			}
		}

		return v;
	});
}
