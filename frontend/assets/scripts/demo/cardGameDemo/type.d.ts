import { Color } from "cc";

export interface Card {
	id: string;
	tag: number;
	rank: number;
	icon?: string;
	color?: Color;
	name: string;
	selected?: boolean;
	isMove?: boolean;
}
