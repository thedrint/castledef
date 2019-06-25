
import * as FERMAT from '@mathigon/fermat';
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import Utils from './../Utils';

import Colors from './../Colors';
import * as Constants from './../Constants';
import {Game as GameSettings, FPS} from './../Settings';

import PolygonMap from './../pathfind/PolygonMap';
import Polygon from './../pathfind/Polygon';

import Scene from './../Scene';
import Unit from './../Unit';
import Hero from './../Hero';
import Party from './../Party';
import PartyManager from './../PartyManager';
import UnitManager from './../UnitManager';
import RegistryManager from './../RegistryManager';
import Crate from './../models/Crate';


export default class MainScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
		this.initGameObjects();
	}

	preload () {

		// this.resourceLoadingProgress = 0;
		// console.log('MainScene preload()');
		// let loader = PIXI.Loader.shared;
		// const textures = {};

		// loader.load((loader, resources) => {
		// 	Object.assign(this.app.textures, textures);
		// });

		// loader.onProgress.add((loader) => {
		// 	this.resourceLoadingProgress = loader.progress;
		// });
	}

	create () {

		let grass = new PIXI.TilingSprite(this.app.textures.Grass, this.app.screen.width, this.app.screen.height);
		this.addChild(grass);

		this.drawCoords(32);


		// Create parties for our enemies
		let HeroParty = new Party({name:'Heroes', faction: 'Good'});
		let EnemyParty = new Party({name:'Enemies', faction: 'Evil'});
		this.party
			.add(HeroParty)
			.add(EnemyParty)
		;

		// See settings structure in Settings.Defaults.Unit to customize unit
		let heroSettings = this.getUnitSettingsByTemplate(Constants.UNIT.TYPE.HERO, {name:`John Wick`});
		let JohnWick = this.createUnit(heroSettings, Constants.UNIT.TYPE.HERO, Constants.UNIT.PARTY.HERO, 
			new PIXI.Point(128, 128));

		// JohnWick.angle = 45;
		this.drawBounds(JohnWick);
		// console.log(JohnWick);
		// JohnWick.Weapon.pierce();
		
		// Let add another hero
		heroSettings = this.getUnitSettingsByTemplate(Constants.UNIT.TYPE.HERO, {
			name  :`Baba Yaga`, 
			model: {
				colors: {armor: Colors.monokai},
			}
		});
		let BabaYaga = this.createUnit(heroSettings, Constants.UNIT.TYPE.HERO, Constants.UNIT.PARTY.HERO, 
			new PIXI.Point(JohnWick.spawnPoint.x+160, JohnWick.spawnPoint.y+256));
		// JohnWick.angle = 45;
		this.drawBounds(BabaYaga);


		let enemySettings = this.getUnitSettingsByTemplate(Constants.UNIT.TYPE.UNIT, {name:`Bad Guy`});
		let BadGuy = this.createUnit(enemySettings, Constants.UNIT.TYPE.UNIT, Constants.UNIT.PARTY.ENEMY, 
			new PIXI.Point(JohnWick.spawnPoint.x+256, JohnWick.spawnPoint.y+32));
		BadGuy.angle = -135;
		this.drawBounds(BadGuy);

		this.party.get(Constants.UNIT.PARTY.HERO).setLeader(JohnWick);

		// Add some obstacles to scene
		let cratesOnScene = [
			128+64, 128,
			128+128+64, 128+32,
			// [256+192, 256],
			// [256+64, 256+128],
		];
		Utils.flatToCoords(cratesOnScene).forEach( (coords, i) => {
			let crate = new Crate({
				name: `Crate #${i}`,
				model: {
					texture: this.app.textures.Crate,
				},
			});
			this.drawChild(crate, coords);
			// crate.angle = Utils.randomInt(0, 90);
			this.registry.add(crate);
		});

		IntersectHelper.updateShape(...this.registry.values());
		// this.registry.forEach(v => console.log(v.name, v.shape.vertices));

		this.drawLOS(JohnWick, BadGuy, Colors.green, 1)
			.drawLOS(JohnWick, BabaYaga, Colors.green, 1)
			.drawLOS(BabaYaga, BadGuy, Colors.green, 1)
		;

		// let pathCoords = JohnWick.getPathTo(BadGuy);
		// this.drawPath(JohnWick, Colors.pink, 16, ...pathCoords);
		// pathCoords = BabaYaga.getPathTo(BadGuy);
		// this.drawPath(BabaYaga, Colors.pink, 8, ...pathCoords);

		let pathCoords = [];
		let testCode = () => {
			// this.getMap(true);
			pathCoords = JohnWick.getPathTo(BadGuy);
		}

		let res = Utils.perfTest('create map and calculate path', 10, testCode);
		console.log(`${res.name} in ${res.result.duration/res.n}ms (${res.result.duration}ms for ${res.n} tests)`);

		this.drawPath(JohnWick, Colors.pink, 16, ...pathCoords);

		let measures = [
			'checkInMainPoly', 
			'checkInTooClose', 
			'checkMiddlePointInside', 
			'checkEdgesForCross', 
			'InLineOfSight', 
			'selfCrossing', 
			'vertexCollect', 
			'createGraph', 
			'calculatePath', 
			'AstarAlgorithm', 
			'pointInside', 
			'LineSegmentsCross', 
		];
		console.table(measures.reduce((a,v)=>{
			return [...a,[v,Utils.sumPerf(v)/res.n]]
		}, []));

	}


	update () {
		this.fighters.forEach( fighter => {
			if( fighter.isDied() )
				return;

			// this.seekAndDestroy(fighter);
			this.drawBounds(fighter.Shield, Colors.metal).drawBounds(fighter.Weapon, Colors.pink);
			let closest = fighter.getClosest();
			this.drawLOS(fighter, closest.enemy.unit, Colors.green, 1);
			this.registry.forEach(v => this.drawBounds(v));
		});
	}

	seekAndDestroy (fighter) {
		let closest = fighter.getClosest();
		if( fighter instanceof Hero && !closest.enemy ) {
			fighter.Body.alpha = 1;
			fighter.Shield.alpha = 1;

			fighter.followTo(fighter.spawnPoint);

			return;
		}

		if( fighter instanceof Hero && closest.enemy.distance <= fighter.Weapon.getLength()*2.5 ) {
			fighter.easeRotateTo(fighter.getWeaponTargetAngle(closest.enemy.unit));
			fighter.Weapon.pierce(closest.enemy.unit);
		}

		this.clash(fighter, closest);
	}

	getFighterIntersects (fighter, enemy) {

		let fighterShapes = {
			weapon : fighter.Weapon,
			// shield : fighter.Shield,
			// body   : fighter.Body,
		};
		let enemyShapes   = {
			// weapon : enemy.Weapon,
			shield : enemy.Shield,
			body   : enemy.Body,
		}

		for( let k in fighterShapes ) {
			IntersectHelper.updateIntersectShape(fighterShapes[k]);
		}
		for( let k in enemyShapes ) {
			IntersectHelper.updateIntersectShape(enemyShapes[k]);
		}

		const checkIntersects = {
			weapon2shield : fighterShapes.weapon.shape.collidesRectangle(enemyShapes.shield.shape),
			weapon2body   : fighterShapes.weapon.shape.collidesCircle(enemyShapes.body.shape),
			// shield2body   : fighterShapes.shield.shape.collidesCircle(enemyShapes.body.shape),
			// shield2shield : fighterShapes.shield.shape.collidesRectangle(enemyShapes.shield.shape),
			// body2body     : fighterShapes.body.shape.collidesCircle(enemyShapes.body.shape),
		};

		return checkIntersects;
	}

	clash (fighter, closest) {

		let enemy = closest.enemy.unit;
		let collides = this.getFighterIntersects(fighter, enemy);
		let isInterects = false;
		// console.log(collides);
		if( collides.weapon2shield ) {
			enemy.Shield.alpha = 0.2;
			isInterects = true;
		}
		else {
			enemy.Shield.alpha = 1;
		}

		if( collides.weapon2body ) {
			enemy.Body.alpha = 0.2;
			isInterects = true;
		}
		else {
			enemy.Body.alpha = 1;
		}

		let collideShapes = [];
		if( collides.weapon2shield )
			collideShapes.push('shield');
		if( collides.weapon2body )
			collideShapes.push('body');
		// console.log(`${fighter.name}'s weapon pierced enemy's ${collideShapes.join(' and ')}`);

		if( isInterects && collides.weapon2body ) {
			// console.log('clash!');
			if( fighter.Weapon.collider ) {
				return;
			}

			fighter.Weapon.collider = true;
			fighter.hitHp(enemy);

			if( enemy.isDied() ) {

				setTimeout(() => {
					this.removeBounds(enemy)
						.removeBounds(enemy.Weapon)
						.removeBounds(enemy.Shield)
					;
					enemy.party.disbandUnit(enemy);
					this.fighters.delete(enemy);
					enemy.destroy();
				}, 1000);


				setTimeout(() => {
					let enemySettings = {name:`Bad Guy`, 
						attrs: {lvl:10, attack:5},
						model: {
							textures: {
								weapon: this.app.textures.Sword, 
								shield: this.app.textures.RoundShield, 
							},
						},
					};

					this.createUnit(enemySettings, Constants.UNIT.TYPE.UNIT, Constants.UNIT.PARTY.ENEMY, new PIXI.Point(
						Utils.randomInt(256, this.app.screen.width - 32),
						Utils.randomInt(32, this.app.screen.height - 32)
					));
				}, 5000);

				return;
				
			}
		}

		let strategy = fighter.tactic.chooseAction();
		// console.log(fighter.name, strategy);
		if( !strategy )
			return;
		// If both, nearest enemy and friend, too far - move to enemy
		if( strategy.action == 'followTo' ){
			fighter.followTo(...strategy.params);
			return;
		}
		// If enemy too far but friend in close range - make step backward from friend to get more space for moves
		// else if( strategy.action == 'backwardStep' ) {
		// 	fighter.backwardStep(...strategy.params);
		// 	return;
		// }
	}
	/**
	 * Init internal scene objects
	 * @return none
	 */
	initGameObjects () {
		this.party = new PartyManager(this);
		this.fighters = new UnitManager(this);
		this.registry = new RegistryManager(this);

		// this.map = this.getMap();
	}

	initMap () {
			this.map = new PolygonMap(this.app.screen.width, this.app.screen.height);
			[...this.registry]
				.filter( p => !(p instanceof Unit) )
				.forEach( p => this.map.polygons.push(new Polygon( ...Utils.atoc(p.shape.vertices) )) );

			this.map.createGraph();
			return this.map;
	}

	getMap (recreate = false) {
		if( !this.map || recreate ) 
			this.initMap();

		return this.map;
	}

	createUnit (settings, 
		type     = Constants.UNIT.TYPE.UNIT, 
		party    = Constants.UNIT.PARTY.ENEMY, 
		position = new PIXI.Point(0,0)
	) {
		let unit = new type(settings);
		unit.spawnPoint = position;

		this.drawChild(unit, unit.spawnPoint);
		
		this.fighters.add(unit);
		this.party.get(party).hireUnit(unit);

		return unit;
	}

	getUnitSettingsByTemplate (typeTemplate, customSettings) {
		let unitSettingsTpl;
		switch( typeTemplate ) {
			case Constants.UNIT.TYPE.HERO:
				unitSettingsTpl = {
					name  :`Some Hero`, 
					attrs : {lvl:10, attack:10, immortal:true},
					model: {
						colors: {armor: Colors.purple},
						textures: {
							weapon: this.app.textures.Sword, 
							shield: this.app.textures.Shield, 
						},
					}
				};
				break;
			default:
				unitSettingsTpl = {name:`Bad Guy`, 
					attrs: {lvl:10, attack:5},
					model: {
						textures: {
							weapon: this.app.textures.Sword,
							shield: this.app.textures.RoundShield,
						},
					},
				};
				break;
		}

		return Object.assign({}, unitSettingsTpl, customSettings)
	}

}