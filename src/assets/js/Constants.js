
import Unit from './Unit';
import Hero from './Hero';

export const ONE_DEGREE = Math.PI/180;

export const UNIT = {
	SPECIALIZATION : {
		INFANTRY    : 'infantry', 
		ARCHERS     : 'archers', 
		CAVALRY     : 'cavalry', 
		SKIRMISHERS : 'skirmishers', 
		ARTILLERY   : 'artillery', 
		SUPPORT     : 'support', 
		GUARDS      : 'guards', 
		HQ          : 'hq', 
	},
	TYPE : {
		HERO : Hero,
		UNIT : Unit,
	},
	PARTY : {
		HERO  : 'Heroes',
		ENEMY : 'Enemies',
	},
};
