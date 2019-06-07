
import Phaser from 'phaser';

export default class Unit extends Phaser.GameObjects.Container {

	constructor (scene, x, y, settings = {}, attrs = {}, skills = {}, equipment = {}) {
		super(scene, x, y);
		scene.add.existing(this);
		
		this.initSettings(settings);
		this.initAttrs(attrs);
		this.initSkills(skills);
		this.initEquipment(equipment);

		// this.frameCnt = 0;

		// this.model = undefined;

		this.initModel();
	}

	initSettings (settings) {
		let {
			name     = `John Doe`,
			immortal = false,
		} = settings;
		let unitSettings = {
			name     ,
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

	initModel (modelParams = {}) {
		let {
			size  = 32,
			color = 0x00ff00,
		} = modelParams;
		let params = {
			size  , 
			color ,
		};

		this.setSize(params.size, params.size);

		let body = this.scene.add.ellipse(0, 0, params.size, params.size, params.color);
		this.add(body);

		let helmet = this.scene.add.rectangle(0, 0, params.size/8, params.size/8, 0x000000);
		this.add(helmet);

		let weapon = this.scene.add.line(0, 0, 0, params.size/2, params.size/2, params.size/2, 0x0000ff);
		weapon.setOrigin(0);
		this.add(weapon);

		let shield = this.scene.add.line(params.size/8+1, -params.size/8+1, +1, -params.size/2, params.size/2-1, -1, 0x654321);
		shield.setOrigin(0);
		this.add(shield);

		let bounds = this.getBounds();
		// let render = this.scene.add.graphics();
		// render.lineStyle(1, 0xff0000);
		// render.strokeRectShape(bounds);
		console.log(bounds);
		console.log(this);

		this.mover = this.scene.plugins.get('rexMoveTo').add(this, {
			speed: 60,
			rotateToTarget: true,
		}).on('complete', () => console.log(`Target reached`));

		// this.setAngle(90);
	}

	isReady () {
		return this.ready;
	}

	hitHp (target) {
		if( target.immortal )
			return;

		let damage = this.calcHpDamage() - this.calcHpDefend();
		target.attrs.hp -= damage;
		console.log(`${this.name} hitted ${target.name} with ${damage} damage`);
		if( target.isDied() ) {
			//TODO: Event - Target unit dies
			console.log(`${target.name} killed!`);
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

	getClosestEnemy () {
		let closestEnemy = undefined;
		for( let enemy of this.scene.fighters ) {
			if( enemy == this || enemy.isDied() )
				continue;

			let vector = new Phaser.Math.Vector2(enemy.x - this.x, enemy.y - this.y);
			let distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
			if( !closestEnemy )
				closestEnemy = {enemy, distance, vector};
			if( closestEnemy.distance > distance )
				closestEnemy = {enemy, distance, vector};
		}

		return closestEnemy;
	}
}