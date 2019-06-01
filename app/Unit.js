// Hello

export default class Unit {

	constructor (settings = {}, attrs = {}) {
		this.initSettings(settings);
		this.initAttrs(attrs);
	}

	initSettings (settings) {
		let {
			title = `John Doe`,
			type  = `Base`,
			immortal  = false,
		} = settings;
		let unitSettings = {
			title,
			type,
		};
		Object.assign(this, unitSettings);
	}

	initAttrs (attrs) {
		this.attrs = {};
		let {
			lvl    = 0,
			hp     = undefined,
			mp     = undefined,
			attack = 0,
			defend = 0,
			speed  = 10,
		} = attrs;
		let unitAttrs = {
			lvl,
			hp,
			mp,
			attack,
			defend,
			speed,
		};
		Object.assign(this.attrs, unitAttrs);

		if( this.attrs.hp == undefined ) {
			this.attrs.hp = this.getFullHp();
		}
		if( this.attrs.mp == undefined ) {
			this.attrs.mp = this.getFullMp();
		}
	}

	hitHp (target) {
		let damage = this.calcHpDamage() - this.calcHpDefend();
		target.attrs.hp -= damage;
		if( target.isDied() ) {
			//TODO: Event - Target unit dies
		}
	}

	getFullHp () {
		let fullHp = this.attrs.lvl * 10;
		return fullHp;
	}

	isDied () {
		return this.attrs.hp <= 0;
	}

	getFullMp () {
		let fullMp = this.attrs.lvl * 10;
		return fullMp;
	}

	calcHpDamage () {
		//TODO: Make formula better
		let damage = this.attrs.attack;
		return damage;
	}

	calcHpDefend () {
		//TODO: Make formula better
		let defend = this.attrs.defend;
		return defend;
	}

}