import { ApiCall } from "tsrpc";
import { ReqSendChat, ResSendChat } from "../../shared/protocols/roomServer/PtlSendChat";
import { RoomServerConn } from "../RoomServer";

/**
 * 简单的 HTML 转义，防止 XSS
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 简单的敏感词过滤（可扩展）
 */
function filterContent(content: string): string {
	// 过滤前后空格
	content = content.trim();
	// 限制消息长度
	if (content.length > 500) {
		content = content.substring(0, 500);
	}
	return content;
}

export async function ApiSendChat(call: ApiCall<ReqSendChat, ResSendChat>) {
	const conn = call.conn as RoomServerConn;
	const room = conn.currentRoom;
	const currentUser = conn.currentUser;

	if (!room) {
		return call.error("您不在任何房间中");
	}

	if (!currentUser) {
		return call.error("用户信息无效");
	}

	// 过滤和转义聊天内容
	const filteredContent = filterContent(call.req.content);
	const safeContent = escapeHtml(filteredContent);

	room.broadcastMsg("serverMsg/Chat", {
		time: new Date(),
		content: safeContent,
		user: currentUser,
	});

	call.succ({});
}
