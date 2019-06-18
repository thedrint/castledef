
import * as PIXI from 'pixi.js';
import IntersectHelper from './IntersectHelper';

import { Game as GameSettings, Defaults } from './Settings';

import Utils from './Utils';

import Container from './base/Container';

import Scene from './Scene';
import Body from './models/Body';
import Helmet from './models/Helmet';
import Weapon from './models/Weapon';
import Shield from './models/Shield';

export default class Unit extends Container {

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
		// let body = Scene.createShape(new PIXI.Ellipse(0, 0, radius, radius), params.armorColor);
		let body = new Body({model:{color:params.colors.armor}});
		body.setTransform(0, 0);
		models.push(body);

		let helmet = new Helmet({model:{color:params.colors.helmet}});
		helmet.setTransform(0, 0);
		models.push(helmet);

		let weapon = new Weapon({model:{color:params.colors.weapon, texture: params.textures.weapon}});
		weapon.x = 0;
		weapon.y = params.size/2;
		weapon.angle = -10;
		models.push(weapon);

		let bodyRadius = radius;
		let shieldAngle = 45;
		let shieldDot = {
			x: bodyRadius*Math.sin(shieldAngle),
			y: -bodyRadius*Math.cos(shieldAngle),
		}
		let shield = new Shield({model:{color:params.colors.shield, texture: params.textures.shield}});
		shield.x = shieldDot.x;
		shield.y = shieldDot.y;
		shield.angle = shieldAngle;
		models.push(shield);

		this.addChild(...models);

		this.pivot.x += params.size/2;
		this.pivot.y += params.size/2;

		this.shape = new IntersectHelper.Rectangle(this);
	}

	isReady () {
		return this.ready;
	}


	get Body () {
		return this.getChildByName('Body');
	}

	get Helmet () {
		return this.getChildByName('Helmet');
	}

	get Weapon () {
		return this.getChildByName('Weapon');
	}

	get Shield () {
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

			let distance = Utils.distance(this, enemy);
			if( !closestEnemy )
				closestEnemy = {enemy, distance};
			if( closestEnemy.distance > distance )
				closestEnemy = {enemy, distance};
		}

		return closestEnemy;
	}

}