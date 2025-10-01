// import { _decorator, Component, EditBox, Label, Layout, Node } from "cc";
// import { WsClient } from "tsrpc-browser";
// import { getClient } from "./getClient";
// import { MsgChat } from "./shared/protocols/MsgChat";
// import { ServiceType } from "./shared/protocols/serviceProto";
// const { ccclass, property } = _decorator;

// @ccclass("ChatComponent")
// export class ChatComponent extends Component {
// 	@property(EditBox) input: EditBox = null!;
// 	@property(Node) list: Node = null!;

// 	public client: WsClient<ServiceType>;

// 	onLoad() {
// 		this.client = getClient();
// 		// Connect at startup
// 		this.client.connect().then((v) => {
// 			if (!v.isSucc) {
// 				alert("= Client Connect Error =\n" + v.errMsg);
// 			}
// 		});

// 		// Listen Msg
// 		this.client.listenMsg("Chat", (v) => {
// 			this.onChatMsg(v);
// 		});
// 	}

// 	start() {}

// 	async send() {
// 		let ret = await this.client.callApi("Send", {
// 			content: this.input.string,
// 		});

// 		// Error
// 		if (!ret.isSucc) {
// 			alert(ret.err.message);
// 			return;
// 		}

// 		// Success
// 		this.input.string = "";
// 	}

// 	onChatMsg(msg: MsgChat) {
// 		let labelNode = new Node();
// 		labelNode.layer = this.list.layer;
// 		let label = labelNode.addComponent(Label);
// 		label.string = `[${new Date(msg.time).toLocaleTimeString()}] ${msg.content}`;

// 		this.list.addChild(labelNode);
// 	}

// 	update(deltaTime: number) {}
// }
