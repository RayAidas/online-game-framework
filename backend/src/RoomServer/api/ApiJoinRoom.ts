import { ApiCall } from "tsrpc";
import * as uuid from "uuid";
import { roomServer } from "../../roomServer";
import { RedisRoomStateService } from "../../services/RedisRoomStateService";
import { RoomStateService } from "../../services/RoomStateService";
import { ReqJoinRoom, ResJoinRoom } from "../../shared/protocols/roomServer/PtlJoinRoom";
import { UserInfo } from "../../shared/types/UserInfo";
import { ColorGenerator } from "../../utils/ColorGenerator";
import { RoomServerConn } from "../RoomServer";

export async function ApiJoinRoom(call: ApiCall<ReqJoinRoom, ResJoinRoom>) {
	// 检查用户是否已经在房间中
	if (call.currentUser && RoomStateService.isUserInRoom(call.currentUser.uid)) {
		const currentRoomId = RoomStateService.getUserRoomId(call.currentUser.uid);
		console.log(`用户 ${call.currentUser.uid} 尝试加入房间 ${call.req.roomId}，但已在房间 ${currentRoomId} 中`);

		// 检查用户当前房间是否真实存在
		const currentRoom = roomServer.id2Room.get(currentRoomId!);
		if (!currentRoom) {
			console.log(`用户当前房间 ${currentRoomId} 不存在，强制清理用户状态`);
			RoomStateService.forceClearUserState(call.currentUser.uid);
		} else {
			return call.error("您已经在房间中，请先退出当前房间", { code: "ALREADY_IN_ROOM" });
		}
	}

	// 创建用户信息
	const currentUser: UserInfo = {
		id: call.currentUser ? call.currentUser.uid.toString() : uuid.v4(),
		nickname: call.req.nickname,
	};

	// 使用颜色生成器生成用户颜色
	const userColor = ColorGenerator.generateUserColor();
	console.log(`为用户 ${currentUser.nickname} 生成颜色: RGB(${userColor.r}, ${userColor.g}, ${userColor.b})`);
	const conn = call.conn as RoomServerConn;
	conn.currentUser = currentUser;

	let room = roomServer.id2Room.get(call.req.roomId);
	if (!room) {
		return call.error("房间不存在", { code: "ROOM_NOT_EXISTS" });
	}

	if (room.data.users.length >= room.data.maxUser) {
		return call.error("该房间已满员");
	}

	// 用户已经在本房间中，可能是通过其它设备登录，踢出旧连接
	let existedConns = room.conns.filter((v) => v.currentUser!.id === currentUser.id);
	existedConns.forEach((v) => {
		room!.leave(v);
	});
	// 用户正在其它房间中，从已有房间中退出
	if (conn.currentRoom) {
		conn.currentRoom.leave(conn);
	}

	// 如果是第一个用户加入房间，设置为房主
	if (room.data.users.length === 0) {
		room.data.ownerId = currentUser.id;
	}

	room.conns.push(conn);
	room.data.users.push({
		...currentUser,
		color: userColor,
		isOffline: false, // 新加入的用户默认在线
	});
	room.userStates[currentUser.id] = {
		uid: currentUser.id,
		pos: {
			x: Math.random() * 10,
			y: 0,
			z: Math.random() * 10,
		},
		rotation: {
			x: 0,
			y: 0,
			z: 0,
			w: 1,
		},
		aniState: "idle",
	};
	conn.currentRoom = room;
	room.listenMsgs(conn);
	room.data.lastEmptyTime = undefined;
	room.data.updateTime = Date.now();

	// 记录用户房间状态（内存）
	if (call.currentUser) {
		RoomStateService.userJoinRoom(call.currentUser.uid, room.data.id);
	}

	// 持久化用户房间状态到Redis
	if (call.currentUser) {
		await RedisRoomStateService.userJoinRoom(call.currentUser.uid, room.data.id, {
			userId: call.currentUser.uid,
			nickname: currentUser.nickname,
			color: userColor,
			isOffline: false,
		});
	}

	call.succ({
		roomData: room.data,
		currentUser: currentUser,
	});

	room.broadcastMsg("serverMsg/UserJoin", {
		time: new Date(),
		user: currentUser,
		color: userColor,
	});
}
