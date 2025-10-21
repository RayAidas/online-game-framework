import { Vec2, Vec3 } from "cc";

export const getDistance = (pos1: Vec3 | Vec2, pos2: Vec3 | Vec2) => {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};

export const randomInt = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

!(function (): any {
	let _w_ = 0;
	let _z_ = 987654321;
	let mask = 0xffffffff;
	function random() {
		_z_ = (36969 * (_z_ & 65535) + (_z_ >> 16)) & mask;
		_w_ = (18000 * (_w_ & 65535) + (_w_ >> 16)) & mask;
		let result = ((_z_ << 16) + _w_) & mask;
		result /= 4294967296;
		return result + 0.5;
	}
	let origin_random = Math.random;
	Object.defineProperty(Math, "randomSeed", {
		get: function () {
			return _w_;
		},
		set: function (seed: number) {
			if (!!+seed) {
				_w_ = seed;
				_z_ = 987654321;
				Math.random = random;
			} else {
				_w_ = 0;
				_z_ = 987654321;
				Math.random = origin_random;
			}
		},
		enumerable: true,
		configurable: true,
	});
})();
