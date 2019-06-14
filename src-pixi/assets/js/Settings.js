
export const ApplicationSettings = {
	width: 640,
	height: 480,
	autoStart: false, 
	backgroundColor: 0xffffff,
};

export const FPS = {
	min    : 10, 
	max    : 120, 
	target : 60,
};

export const GameSettings = {
	title: `CastleDef`,
	version: `0.0.1-pixi`,
	unit: {
		size: 64,
	},
};

export const Defaults = {
	unit: {
		name: 'John Doe', 
		attrs : {
			immortal : false,
			lvl      : 0,
			hp       : undefined,
			mp       : undefined,
			attack   : 0,
			defend   : 0,
			speed    : 1,
		},
		skills : {
			strength  : 0,
			agility   : 0,
			intellect : 0,
		},
		equipment : {
			head    : undefined,
			hands   : undefined,
			fingers : undefined,
			foots   : undefined,
			neck    : undefined,
			legs    : undefined,
			body    : undefined,
			arms    : undefined,
		},
		model : {
			size        : GameSettings.unit.size,
			armorColor  : 0x00ff00,
			helmetColor : 0x000000,
			weaponColor : 0x999999,
			shieldColor : 0x654321,
		},
	}, 
	weapon : {
		name : `Weapon`,
		attrs : {
			damage : 1,
		}, 
		model : {
			size  : 1,
			color : 0x999999,
		}, 
	}, 
	shield : {
		name : `Shield`,
		attrs : {
			defend : 1,
		}, 
		model : {
			size  : 0.5,
			color : 0x654321,
		}, 
	}, 
}