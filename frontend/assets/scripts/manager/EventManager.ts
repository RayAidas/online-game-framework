import Singleton from "../common/Singleton";

export default class EventManager extends Singleton {
	/**事件列表*/
	private eventList = {};

	/**
	 * 发送事件
	 * @type 事件类型
	 * @args 携带数据
	 */
	public emit(type: string, ...args: any[]) {
		var arr: Array<any> = this.eventList[type];
		if (arr != null) {
			var len = arr.length;
			var listen: Function;
			var thisObject: any;
			for (var i = 0; i < len; i++) {
				var msg = arr[i];
				listen = msg[0];
				thisObject = msg[1];
				listen.apply(thisObject, args);
			}
		}
	}

	/**
	 * 监听事件
	 * @type 事件类型
	 * @listener 回调函数
	 * @thisObject 回调执行对象
	 */
	public on(type: string, listener: Function, thisObject: any) {
		var arr: Array<any> = this.eventList[type];
		if (arr == null) {
			arr = [];
			this.eventList[type] = arr;
		} else {
			var len = arr.length;
			for (var i = 0; i < len; i++) {
				if (arr[i][0] == listener && arr[i][1] == thisObject) {
					return;
				}
			}
		}
		arr.push([listener, thisObject]);
	}

	/**
	 * like "on" but just run once
	 * @type 事件类型
	 * @listener 回调函数
	 * @thisObject 回调执行对象
	 */
	public once(type: string, listener: Function, thisObject: any) {
		var unsubscribe = undefined;
		unsubscribe = this.on(
			type,
			(...args: any[]) => {
				listener.apply(thisObject, args);
				// unsubscribe();
			},
			thisObject
		);
	}

	/**
	 * 移除事件
	 * @type 事件类型
	 * @listener 回调函数
	 * @thisObject 回调执行对象
	 */
	public off(type: string, listener, thisObject: any) {
		var arr: Array<any> = this.eventList[type];
		if (arr != null) {
			var len = arr.length;
			for (var i = len - 1; i >= 0; i--) {
				if (arr[i][0] == listener && arr[i][1] == thisObject) {
					arr.splice(i, 1);
				}
			}
		}
		if (arr && arr.length == 0) {
			this.eventList[type] = null;
			delete this.eventList[type];
		}
	}

	getEventNames() {
		const eventNames: string[] = [];
		for (let eventName in this.eventList) {
			eventNames.push(eventName);
		}
		return eventNames;
	}

	/**
	 * getEventNames别名, 为了和node的api一致
	 */
	eventNames() {
		return this.getEventNames();
	}
	// on(eventName: string, cb: (data: any) => void, target?: any) {
	// 	cc.director.on(eventName, cb, target);
	// }

	// once(eventName: string, cb: (data: any) => void, target?: any) {
	// 	cc.director.once(eventName, cb, target);
	// }

	// off(eventName: string, cb?: (data: any) => void, target?: any) {
	// 	cc.director.off(eventName, cb, target);
	// }

	// emit(eventName: string, data?: any) {
	// 	cc.director.emit(eventName, data);
	// }
}
