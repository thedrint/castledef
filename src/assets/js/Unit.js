
import * as PIXI from 'pixi.js';
import IntersectHelper from './IntersectHelper';

import { GameSettings, FPS, Defaults } from './Settings';

import Utils from './Utils';
import Scene from './Scene';
import Weapon from './Weapon';
import Shield from './Shield';

export default class Unit extends PIXI.Container {

	constructor (settings = {
		name: Defaults.unit.name, 
		attrs: Defaults.unit.attrs, 
		skills: Defaults.unit.skills, 
		equipment: Defaults.unit.equipment,
		model: Defaults.unit.model, 
	}) {

		super();

		let { 
			name      = Defaults.unit.name, 
			attrs     = Defaults.unit.attrs, 
			skills    = Defaults.unit.skills, 
			equipment = Defaults.unit.equipment,
			model     = Defaults.unit.model, 
		} = settings;
		this.name = name;

		this.initAttrs(attrs);
		this.initSkills(skills);
		this.initEquipment(equipment);
		this.initModel(model);
	}

	initAttrs (attrs = Defaults.unit.attrs) {
		this.attrs = Utils.cleanOptionsObject(attrs, Defaults.unit.attrs);

		if( this.attrs.hp == undefined ) 
			this.attrs.hp = this.getFullHp();
		if( this.attrs.mp == undefined ) 
			this.attrs.mp = this.getFullMp();
	}

	initSkills (skills = Defaults.unit.skills) {
		this.skills = Utils.cleanOptionsObject(skills, Defaults.unit.skills);
	}

	initEquipment (equipment = Defaults.unit.equipment) {
		this.equipment = Utils.cleanOptionsObject(equipment, Defaults.unit.equipment);
	}

	initModel (model = Defaults.unit.model) {
		let params = Utils.cleanOptionsObject(model, Defaults.unit.model);

		let radius = params.size/2;

		let models = [];
		//TODO: Make separate class Body or Armor
		let body = Scene.createShape(new PIXI.Ellipse(0, 0, radius, radius), params.armorColor);
		body.name = 'Body';
		body.shape = new IntersectHelper.Circle(body);
		models.push(body);

		//TODO: Make separate class Helmet
		let helmet = Scene.createShape(new PIXI.Ellipse(0, 0, radius/2, radius/2), params.helmetColor);
		helmet.name = 'Helmet';
		helmet.shape = new IntersectHelper.Circle(helmet);
		models.push(helmet);

		let weapon = new Weapon({model:{color:params.weaponColor}});
		weapon.setTransform(0, params.size/2);
		// weapon.x = 0;
		// weapon.y = params.size/2;
		// weapon.angle = -90;		
		models.push(weapon);

		let bodyRadius = radius;
		let shieldAngle = 45;
		let shieldDot = {
			x: bodyRadius*Math.sin(shieldAngle),
			y: -bodyRadius*Math.cos(shieldAngle),
		}
		let shield = new Shield({model:{color:params.shieldColor}});
		// shield.setTransform(undefined, undefined, undefined, undefined, undefined, undefined, undefined, );
		// shield.setTransform(shieldDot.x, shieldDot.y, undefined, undefined, shieldAngle*Math.PI/180);
		shield.x = shieldDot.x;
		shield.y = shieldDot.y;
		shield.angle = shieldAngle;
		models.push(shield);

		this.addChild(...models);

		this.shape = new IntersectHelper.Rectangle(this);
	}

	isReady () {
		return this.ready;
	}


	getWeapon () {
		return this.getChildByName('Weapon');
	}

	getShield () {
		return this.getChildByName('Shield');
	}

	hitHp (target) {
		if( target.attrs.immortal )
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

	getSpeed () {
		let baseSpeed = this.attrs.speed*GameSettings.unit.size;
		let speedMod = baseSpeed*this.skills.agility/10;
		return baseSpeed + speedMod;
	}

	getWeaponSpeed () {
		let baseSpeed = (this.skills.agility+1)/10/2;
		return baseSpeed;
	}

	getClosestEnemy () {
		let closestEnemy = undefined;
		for( let enemy of this.scene.fighters ) {
			if( enemy == this || enemy.isDied() )
				continue;

			let distance = Utils.distanceBetween(this, enemy);
			if( !closestEnemy )
				closestEnemy = {enemy, distance};
			if( closestEnemy.distance > distance )
				closestEnemy = {enemy, distance};
		}

		return closestEnemy;
	}
}