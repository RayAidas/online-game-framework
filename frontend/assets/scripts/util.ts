import { Vec3, Vec2 } from "cc";

export const getDistance = (pos1: Vec3 | Vec2, pos2: Vec3 | Vec2) => {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};
