import { ApiCall } from "tsrpc";
import { roomServer } from "../../roomServer";
import { RedisRoomStateService } from "../../services/RedisRoomStateService";
import { RoomStateService } from "../../services/RoomStateService";
import { ReqRejoinRoom, ResRejoinRoom } from "../../shared/protocols/roomServer/PtlRejoinRoom";
import { UserInfo } from "../../shared/types/UserInfo";
import { RoomServerConn } from "../RoomServer";
import { GamePhase } from "../../shared/types/GamePhase";

export async function ApiRejoinRoom(call: ApiCall<ReqRejoinRoom, ResRejoinRoom>) {
	if (!call.currentUser) {
		return call.error("未登录", { code: "NOT_LOGGED_IN" });
	}

	// 从Redis获取用户的房间信息
	const roomInfo = await RedisRoomStateService.getUserRoomInfo(call.currentUser.uid);

	if (!roomInfo) {
		return call.error("没有找到之前的房间信息", { code: "NO_ROOM_INFO" });
	}

	const roomId = roomInfo.roomId;
	const room = roomServer.id2Room.get(roomId);

	if (!room) {
		// 房间已经不存在，清理Redis中的状态
		await RedisRoomStateService.userLeaveRoom(call.currentUser.uid);
		return call.error("房间已不存在", { code: "ROOM_NOT_EXISTS" });
	}

	const conn = call.conn as RoomServerConn;

	// 创建用户信息（使用Redis中保存的信息）
	const currentUser: UserInfo = {
		id: call.currentUser.uid.toString(),
		nickname: roomInfo.nickname || "玩家",
		gamePhase: roomInfo.gamePhase || GamePhase.WAITING,
	};
	conn.currentUser = currentUser;

	// 检查用户是否已经在其他连接中
	let existedConns = room.conns.filter((v) => v.currentUser!.id === currentUser.id);
	existedConns.forEach((v) => {
		// 移除旧连接
		room!.conns.removeOne((c) => c === v);
	});

	// 如果用户正在其它房间中，从已有房间中退出
	if (conn.currentRoom) {
		conn.currentRoom.leave(conn);
	}

	// 检查用户是否还在房间的用户列表中
	const existingUser = room.data.users.find((u) => u.id === currentUser.id);

	if (existingUser) {
		// 用户还在房间中，重连
		conn.currentRoom = room;
		room.conns.push(conn);
		room.listenMsgs(conn);

		// 清除离线标记
		existingUser.isOffline = false;

		// 恢复用户状态
		if (!room.userStates[currentUser.id]) {
			room.userStates[currentUser.id] = {};
		}
	} else {
		// 用户不在房间中，重新加入
		if (room.data.users.length >= room.data.maxUser) {
			return call.error("该房间已满员");
		}

		// 如果是第一个用户加入房间，设置为房主
		if (room.data.users.length === 0) {
			room.data.ownerId = currentUser.id;
		}

		room.conns.push(conn);
		room.data.users.push({
			...currentUser,
			color: roomInfo.color || { r: 255, g: 255, b: 255 },
		});
		room.userStates[currentUser.id] = {};
		conn.currentRoom = room;
		room.listenMsgs(conn);
	}

	room.data.lastEmptyTime = undefined;
	room.data.updateTime = Date.now();

	// 更新内存状态
	RoomStateService.userJoinRoom(call.currentUser.uid, room.data.id);

	// 标记用户为在线状态
	await RedisRoomStateService.markUserOnline(call.currentUser.uid);

	call.succ({
		roomData: room.data,
		currentUser: currentUser,
		isRejoin: existingUser !== undefined,
	});

	// 如果是重连，广播用户重新上线消息
	if (existingUser) {
		room.broadcastMsg("serverMsg/UserOnline", {
			time: new Date(),
			user: currentUser,
		});
	}
}
