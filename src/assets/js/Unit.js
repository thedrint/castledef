
import * as PIXI from 'pixi.js';
import IntersectHelper from './IntersectHelper';

import { Game as GameSettings, Defaults } from './Settings';

import Utils from './Utils';

import Container from './base/Container';

import PathfindingStrategy from './base/PathfindingStrategy';

import PolygonMap from './pathfind/PolygonMap';
import Polygon from './pathfind/Polygon';

import Scene from './Scene';
import Body from './models/Body';
import Helmet from './models/Helmet';
import Weapon from './models/Weapon';
import Shield from './models/Shield';

export default class Unit extends Container {

	constructor (settings = Defaults.unit) {

		super();

		let { 
			name      = Defaults.unit.name, 
			spec      = Defaults.unit.spec, 
			attrs     = Defaults.unit.attrs, 
			skills    = Defaults.unit.skills, 
			equipment = Defaults.unit.equipment,
			model     = Defaults.unit.model, 
		} = settings;
		this.name = name;
		this.spec = spec;
		this.division = undefined;
		this.party = undefined;

		this.init();

		this.initAttrs(attrs);
		this.initSkills(skills);
		this.initEquipment(equipment);
		this.initModel(model);
	}

	init () {
		this._righthand = undefined;
		this._lefthand  = undefined;

		this.pf = new PathfindingStrategy(this);
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
		// weapon.angle = -10;
		this.rightHand = weapon;
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
		this.leftHand = shield;
		models.push(shield);

		this.addChild(...models);

		this.pivot.x += params.size/2;
		this.pivot.y += params.size/2;

		this.shape = new IntersectHelper.Rectangle(this);
	}

	get rightHand () {
		return this._righthand;
	}

	set rightHand (item) {
		this._righthand = item;
	}

	get leftHand () {
		return this._lefthand;
	}

	set leftHand (item) {
		this._lefthand = item;
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

	getWeaponTargetAngle (target) {
		let tc = Utils.getLocal(target);
		let weapon = this.Weapon;
		let lc = Utils.getLocal(weapon);
		let wc = weapon.toGlobal(lc);
		let targetAngle = Utils.getPointAngle(wc, tc);
		return targetAngle;
	}

	getClosest () {
		let closest = {enemy:undefined, friend:undefined};

		for( let unit of this.scene.fighters ) {
			if( unit == this || unit.isDied() )
				continue;

			let distance = Utils.distance(this, unit);
			let isEnemy = ( unit.party != this.party );
			if( isEnemy ) {
				if( !closest.enemy || closest.enemy.distance > distance ) {
					closest.enemy = {unit, distance};
				}
			}
			else {
				if( !closest.friend || closest.friend.distance > distance ) {
					closest.friend = {unit, distance};
				}
			}
		}

		return closest;
	}

	backwardStep (from, speed = undefined) {
		// If enemy too far but friend in close range - make step backward from friend to get more space for moves
		if( !speed )
			speed = this.getSpeed()/FPS.target;
		let backwardPosition = new PIXI.Point(
			this.x - Math.sign(from.x-this.x)*speed, 
			this.y - Math.sign(from.y-this.y)*speed, 
		);
		return this.followTo(backwardPosition, speed);
	}

	getClosestFriend () {
		let closest = undefined;
		for( let unit of this.party.units ) {
			if( unit == this )
				continue;

			let distance = Utils.distance(this, unit);
			if( !closest || closest.distance > distance )
				closest = {unit, distance};
		}

		return closest;
	}

	/**
	 * Returns "world center" of unit (in fact center of his body for simplify)
	 * @return PIXI.Point {x, y}
	 */
	getCenter () {
		return IntersectHelper.getShapeCenter(this.Body);
	}

	getLOS (target, color = Colors.black, size = 1) {
		let wc = this.getCenter();
		let tc = target.getCenter();
		let los = Scene.createLine(wc, tc, color, size);
		los.target = target;
		return los;
	}

	/**
	 * Creates moving graph, calculate path from current position to target and returns array of path points
	 * @param  {Container|PIXI.Container} target Any object has coordinates properties (x and y)
	 * @return {Array}        [description]
	 */
	getPathTo (target) {
		this.scene.initMap();
		let map = this.scene.map;
		this.scene.registry.forEach( p => {
			if( p == this || p == target )
				return;

			let poly = new Polygon(...Utils.flatToCoords(p.shape.vertices));
			map.polygons.push(poly);
		});

		map.createGraph();
		let path = map.calculatePath(this.getCenter(), target);
		let pathCoords = path.reduce( (a, n) => {
			return [...a, map.walkgraph.nodes[n].pos];
		}, []);

		return pathCoords;
	}

}