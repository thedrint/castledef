
import Colors from './Colors';

export const ApplicationSettings = {
	width: 640,
	height: 512,
	autoStart: false, 
	backgroundColor: Colors.breeze,
};

export const FPS = {
	min    : 10, 
	max    : 60, 
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
			colors      : {
				armor     : Colors.green,
				helmet    : Colors.black,
				weapon    : Colors.metal,
				shield    : Colors.brown,				
			},
			textures    : {
				armor     : undefined,
				helmet    : undefined,
				weapon    : undefined,
				shield    : undefined,				
			},
		},
	}, 
	body : {
		name : `Body`,
		attrs : {
			defend : 0,
		}, 
		model : {
			size  : 1,
			color : Colors.green,
			texture: undefined,
		}, 
	}, 
	helmet : {
		name : `Helmet`,
		attrs : {
			defend : 0,
		}, 
		model : {
			size  : 1,
			color : Colors.black,
			texture: undefined,
		}, 
	}, 
	weapon : {
		name : `Weapon`,
		attrs : {
			damage : 1,
		}, 
		model : {
			size  : 1,
			color : Colors.metal,
			texture: undefined,
		}, 
	}, 
	shield : {
		name : `Shield`,
		attrs : {
			defend : 1,
		}, 
		model : {
			size  : 0.75,
			color : Colors.brown,
			texture: undefined,
		}, 
	}, 
};