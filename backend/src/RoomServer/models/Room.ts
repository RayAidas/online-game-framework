import { PrefixLogger } from "tsrpc";
import { roomServer } from "../../roomServer";
import { RoomStateService } from "../../services/RoomStateService";
import { MsgUpdateRoomState } from "../../shared/protocols/roomServer/clientMsg/MsgUpdateRoomState";
import { ServiceType } from "../../shared/protocols/serviceProto_roomServer";
import { RoomData } from "../../shared/types/RoomData";
import { RoomUserState } from "../../shared/types/RoomUserState";
import { RoomServerConn } from "../RoomServer";

export class Room {
	data: RoomData;
	conns: RoomServerConn[] = [];
	userStates: {
		[uid: string]: RoomUserState;
	} = {};
	logger: PrefixLogger;

	constructor(data: RoomData) {
		this.data = data;

		this.logger = new PrefixLogger({
			logger: roomServer.logger,
			prefixs: [`[Room ${data.id}]`],
		});

		// 每 100ms 同步一次 UserState
		this._setInterval(() => {
			this.broadcastMsg("serverMsg/UserStates", {
				userStates: this.userStates,
			});
		}, 100);
	}

	get state(): MsgUpdateRoomState["rooms"][number] {
		return {
			id: this.data.id,
			name: this.data.name,
			userNum: this.conns.length,
			maxUserNum: this.data.maxUser,
			/** 为 undefined 代表不在匹配中 */
			startMatchTime: this.data.startMatchTime,
			// 房间信息的最后更新时间
			updateTime: this.data.updateTime,
		};
	}

	/** 房间内广播 */
	broadcastMsg<T extends keyof ServiceType["msg"]>(msgName: T, msg: ServiceType["msg"][T]) {
		return roomServer.server.broadcastMsg(msgName, msg, this.conns);
	}

	listenMsgs(conn: RoomServerConn) {
		conn.listenMsg("clientMsg/UserState", (call) => {
			const conn = call.conn as RoomServerConn;
			this.userStates[conn.currentUser.id] = {
				uid: conn.currentUser.id,
				...call.msg,
			};
		});
	}
	unlistenMsgs(conn: RoomServerConn) {
		conn.unlistenMsgAll("clientMsg/UserState");
	}

	leave(conn: RoomServerConn) {
		const currentUser = conn.currentUser;
		this.logger.log("[UserLeave]", currentUser?.id);

		this.conns.removeOne((v) => v === conn);
		this.data.users.removeOne((v) => v.id === currentUser.id);
		delete this.userStates[currentUser.id];
		this.data.updateTime = Date.now();

		if (conn) {
			// 只取消监听消息，不关闭连接
			this.unlistenMsgs(conn);
			// 清除房间引用
			conn.currentRoom = undefined;
		}

		// 尝试从用户ID字符串中提取数字ID来清除状态
		if (currentUser && currentUser.id) {
			const userId = parseInt(currentUser.id);
			if (!isNaN(userId)) {
				RoomStateService.userLeaveRoom(userId);
				this.logger.log(`[UserLeave] 清除用户 ${userId} 的房间状态`);
			}
		}

		if (currentUser) {
			this.broadcastMsg("serverMsg/UserExit", {
				time: new Date(),
				user: currentUser!,
			});
		}

		if (this.conns.length === 0) {
			this.data.lastEmptyTime = Date.now();
		}
	}

	destroy() {
		this.logger.log("[Destroy]");
		this._intervals.forEach((v) => {
			clearInterval(v);
		});
		this._intervals = [];

		// 清理房间状态
		RoomStateService.clearRoomState(this.data.id);

		roomServer.rooms.removeOne((v) => v === this);
		roomServer.id2Room.delete(this.data.id);
	}

	private _intervals: ReturnType<typeof setInterval>[] = [];
	private _setInterval(func: () => void, interval: number) {
		this._intervals.push(setInterval(func, interval));
	}
}
