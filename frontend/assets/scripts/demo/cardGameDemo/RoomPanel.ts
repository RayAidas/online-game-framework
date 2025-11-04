import { _decorator } from "cc";
import { RoomBase } from "../RoomBase";
const { ccclass, property } = _decorator;

@ccclass("RoomPanel")
export class RoomPanel extends RoomBase {
	public isFrameSync: boolean = false;
	start() {}



	update(deltaTime: number) {}
}
