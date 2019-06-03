// Hello

export default class Unit {

	constructor (settings = {}, attrs = {}, skills = {}, equipment = {}) {
		this.initSettings(settings);
		this.initAttrs(attrs);
		this.initSkills(skills);
		this.initEquipment(equipment);

		this.frameCnt = 0;
	}

	initSettings (settings) {
		let {
			title    = `John Doe`,
			type     = `Base`,
			immortal = false,
		} = settings;
		let unitSettings = {
			title    ,
			type     ,
			immortal ,
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
			lvl    ,
			hp     ,
			mp     ,
			attack ,
			defend ,
			speed  ,
		};
		Object.assign(this.attrs, unitAttrs);

		if( this.attrs.hp == undefined ) {
			this.attrs.hp = this.getFullHp();
		}
		if( this.attrs.mp == undefined ) {
			this.attrs.mp = this.getFullMp();
		}
	}

	initSkills (skills) {
		this.skills = {};
		let {
			strength  = 0,
			agility   = 0,
			intellect = 0,
		} = skills;
		let unitSkills = {
			strength  ,
			agility   ,
			intellect ,
		};
		Object.assign(this.skills, unitSkills);
	}

	initEquipment (equipment) {
		this.eq = {};
		let {
			head    = undefined,
			hands   = undefined,
			fingers = undefined,
			foots   = undefined,
			neck    = undefined,
			legs    = undefined,
			body    = undefined,
			arms    = undefined,
		} = equipment;
		let unitEquipment = {
			head    ,
			hands   ,
			fingers ,
			foots   ,
			neck    ,
			legs    ,
			body    ,
			arms    ,
		};
		Object.assign(this.eq, unitEquipment);
	}

	update () {
		this.updateActionFrameCounter();
	}

	updateActionFrameCounter () {
		this.frameCnt++;
		this.ready = false;
		if( this.frameCnt >= this.actionFrame() ) {
			this.ready = true;
			this.frameCnt = 0;
		}
	}

	isReady () {
		return this.ready;
	}

	hitHp (target) {
		let damage = this.calcHpDamage() - this.calcHpDefend();
		target.attrs.hp -= damage;
		console.log(`${this.title} hitted ${target.title} with ${damage} damage`);
		if( target.isDied() ) {
			//TODO: Event - Target unit dies
			console.log(`${this.title} killed ${target.title}`);
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

	actionFrame () {
		let aof = 100/this.attrs.speed;// action on frame, how many frames unit must skip to do next action
		return aof;
	}
}