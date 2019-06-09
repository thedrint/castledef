
import Phaser from 'phaser';
import { gameInternalSettings, FPSConfig } from './GameSettings';
import Weapon from './Weapon';
import Shield from './Shield';

export default class Unit extends Phaser.GameObjects.Container {

	constructor (
		settings = {
			name: `John Doe`, 
			model: {}, 
			attrs: {}, 
			skills: {}, 
			equipment: {}
		}, 
		scene, 
		x = 0, 
		y = 0
	) {
		super(scene, x, y);
		scene.add.existing(this);
		
		this.initSettings(settings);
	}

	initSettings (settings) {
		let {
			name     = `John Doe`,
		} = settings;
		let unitSettings = {
			name     ,
		};
		Object.assign(this, unitSettings);

		this.initAttrs(settings.attrs);
		this.initSkills(settings.skills);
		this.initEquipment(settings.equipment);
		this.initModel(settings.model);
	}

	initAttrs (attrs = {}) {
		this.attrs = {};
		let {
			immortal = false,
			lvl      = 0,
			hp       = undefined,
			mp       = undefined,
			attack   = 0,
			defend   = 0,
			speed    = 1,
		} = attrs;
		let unitAttrs = {
			immortal ,
			lvl      ,
			hp       ,
			mp       ,
			attack   ,
			defend   ,
			speed    ,
		};

		Object.assign(this.attrs, unitAttrs);

		if( this.attrs.hp == undefined ) {
			this.attrs.hp = this.getFullHp();
		}
		if( this.attrs.mp == undefined ) {
			this.attrs.mp = this.getFullMp();
		}
	}

	initSkills (skills = {}) {
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

	initEquipment (equipment = {}) {
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
			size        = gameInternalSettings.unit.size,
			armorColor  = 0x00ff00,
			helmetColor = 0x000000,
			weaponColor = 0x999999,
			shieldColor = 0x654321,
		} = modelParams;
		let params = {
			size        , 
			armorColor  ,
			helmetColor ,
			weaponColor ,
			shieldColor ,
		};

		// this.setSize(params.size, params.size);
		let body = this.scene.add.ellipse(0, 0, params.size, params.size, params.armorColor);
		body.setName('Body');
		this.add(body);

		let helmet = this.scene.add.ellipse(0, 0, params.size/2, params.size/2, params.helmetColor);
		helmet.setName('Helmet');
		this.add(helmet);

		let weapon = new Weapon({model:{color:params.weaponColor}}, this.scene, 0, params.size/2);
		// let weapon = this.scene.add.line(0, 0, 0, params.size/2, params.size, params.size/2, params.weaponColor);
		// weapon.setOrigin(0);
		// weapon.setName('Weapon');
		this.add(weapon);

		let bodyRadius = body.geom.width/2;
		let shieldAngle = 45;
		let shieldDot = {
			x: bodyRadius*Math.sin(shieldAngle),
			y: -bodyRadius*Math.cos(shieldAngle),
		}
		let shield = new Shield({model:{color:params.shieldColor}}, this.scene, shieldDot.x, shieldDot.y);
		// let shield = this.scene.add.line(params.size/8+1, -params.size/8+1, +1, -params.size/2, params.size/2-1, -1, params.shieldColor);
		// shield.setName('Shield');
		shield.setAngle(shieldAngle);
		this.add(shield);

		// console.log(`${this.name} bounds:`, this.getBounds());

		this.mover = this.scene.plugins.get('rexMoveTo').add(this, {
			speed: this.getSpeed(),
			rotateToTarget: true,
		}).on('complete', () => {
			console.log(`Target reached`);
		});
	}

	isReady () {
		return this.ready;
	}

	updateBoundsHelper (gameObject, color = 0xff0000) {
		if( gameObject.boundsHelper ) {
			gameObject.boundsHelper.destroy();
		}
		gameObject.boundsHelper = gameObject.scene.add.graphics();

		// let d = gameObject.getWorldTransformMatrix().decomposeMatrix();
		
		let bounds = gameObject.getBounds();
		console.log(`${gameObject.name} bounds:`, bounds);
		color = 0xff0000;
		gameObject.boundsHelper.clear();
		gameObject.boundsHelper.lineStyle(1, color, 1);
		gameObject.boundsHelper.strokeRectShape(bounds);
		
		// gameObject.boundsHelper.strokeRect(d.translateX-bounds.width/2, d.translateY-bounds.height/2, bounds.width, bounds.height);
		// console.log(gameObject.boundsHelper);
		// this.boundsHelper.setRotation(d.rotation);
	}

	getWeapon () {
		return this.getByName('Weapon');
	}

	getShield () {
		return this.getByName('Shield');
	}

	weaponPierce () {
		let weapon = this.getByName('Weapon');
		let pierceLength = weapon.width;
		this.scene.tweens.add({
			targets: weapon,
			duration: pierceLength/this.getWeaponSpeed(),
			ease: 'Linear',
			yoyo: true,
			repeat:-1,
			x: pierceLength,
		});
	}

	hitHp (target) {
		if( target.attrs.immortal )
			return;

		let damage = this.calcHpDamage() - this.calcHpDefend();
		target.attrs.hp -= damage;
		// console.log(`${this.name} hitted ${target.name} with ${damage} damage`);
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

	getSpeed () {
		let baseSpeed = this.attrs.speed*gameInternalSettings.unit.size;
		let speedMod = baseSpeed*this.skills.agility/10;
		return baseSpeed + speedMod;
	}

	getWeaponSpeed () {
		let baseSpeed = (this.skills.agility+1)/10/2;
		return baseSpeed;
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