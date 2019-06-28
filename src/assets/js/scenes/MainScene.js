
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import Vector from './../base/Vector';
import Utils from './../Utils';

import Colors from './../Colors';
import { UNIT } from './../Constants';

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

import Test from './../Test';

export default class MainScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
		this.initGameObjects();
	}

	preload () {}

	create () {
		// Create floor
		let grass = new PIXI.TilingSprite(this.app.textures.Grass, this.app.screen.width, this.app.screen.height);
		this.addChild(grass);
		// CoordiNet
		this.drawCoords(32);
		
		// Create parties for our enemies
		let HeroParty = new Party({name:'Heroes', faction: 'Good'});
		let EnemyParty = new Party({name:'Enemies', faction: 'Evil'});
		this.party
			.add(HeroParty)
			.add(EnemyParty)
		;
		
		// Create heroes and enemies
		// See settings structure in Settings.Defaults.Unit to customize unit
		let heroTpl = this.getUnitSettingsByTemplate(UNIT.TYPE.HERO, {name:`John Wick`});
		let JohnWick = this.createUnit(heroTpl, UNIT.TYPE.HERO, UNIT.PARTY.HERO, new Vector(128, 128));
		// Let add another hero
		heroTpl = this.getUnitSettingsByTemplate(UNIT.TYPE.HERO, {name  :`Baba Yaga`, 
			model: {colors: {armor: Colors.monokai} }
		});
		let BabaYaga = this.createUnit(heroTpl, UNIT.TYPE.HERO, UNIT.PARTY.HERO, JohnWick.spawnPoint.clone().add(160,256));
		// Now create first enemy
		let enemyTpl = this.getUnitSettingsByTemplate(UNIT.TYPE.UNIT, {name:`Bad Guy`});
		let BadGuy = this.createUnit(enemyTpl, UNIT.TYPE.UNIT, UNIT.PARTY.ENEMY, JohnWick.spawnPoint.clone().add(128,0));
		BadGuy.angle = -135;
		// Let First hero became a leader
		this.party.get(UNIT.PARTY.HERO).setLeader(JohnWick);

		// Add some obstacles to scene
		let cratesOnScene = [
			128+64, 128,
			128+128+64, 128+32,
			// [256+192, 256],
			// [256+64, 256+128],
		];
		Utils.atoc(cratesOnScene).forEach( (coords, i) => {
			let crate = new Crate({name: `Crate #${i}`,
				model: { texture: this.app.textures.Crate },
			});
			this.drawChild(crate, coords);
			// crate.angle = Utils.randomInt(0, 90);// Just for fun
			// Add low-level objects like obstacles to registry manually
			this.registry.add(crate);
		});

		// When all objects are created and drawed - updated their shapes for collider
		// And create base map graph
		this.initMap();

		//TESTAREA
		// Test.getPath(JohnWick, BadGuy);
		// Test.seekAndDestroy(this);
		// Test.getWeaponAngle(JohnWick, BadGuy);
	}

	// Main update loop of scene
	update () {
		this.fighters.forEach( fighter => {
			//TODO: What if deads can moves?
			if( fighter.isDied() ) return;
			this.seekAndDestroy(fighter);
			// this.drawFighterHelpers(fighter);
		});
	}

	seekAndDestroy (fighter) {		// If no orders - analyse situation on this frame
		// Seek
		if( !fighter.tactic.hasCommands() ) {
			let com = fighter.tactic.analyse();
			fighter.tactic.pool.add(com);
		}
		fighter.tactic.pool.execute();
		// Destroy
		let closest = fighter.sensor.getClosestEnemy();
		if( closest )
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

	clash (fighter, closestEnemy) {
		let enemy = closestEnemy.unit;
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

		if( isInterects && collides.weapon2body ) {
			if( fighter.Weapon.collider ) return;

			fighter.Weapon.collider = true;
			fighter.hitHp(enemy);

			if( enemy.isDied() ) {
				//TEST
				setTimeout(() => {
					this.removeBounds(enemy, enemy.Weapon, enemy.Shield);
					enemy.die();
				}, 1000);

				setTimeout(() => {
					let enemySettings = this.getUnitSettingsByTemplate(UNIT.TYPE.UNIT, {name:`Bad Guy`});
					this.createUnit(enemySettings, UNIT.TYPE.UNIT, UNIT.PARTY.ENEMY, new PIXI.Point(
						Utils.randomInt(256, this.app.screen.width - 32),
						Utils.randomInt(32, this.app.screen.height - 32)
					));
				}, 5000);

				return;
			}
		}
	}
	/**
	 * Init internal scene objects
	 * @return none
	 */
	initGameObjects () {
		this.party    = new PartyManager(this);
		this.fighters = new UnitManager(this);
		this.registry = new RegistryManager(this);
	}

	initMap () {
			IntersectHelper.updateShape(...this.registry.values());
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
		type     = UNIT.TYPE.UNIT, 
		party    = UNIT.PARTY.ENEMY, 
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
			case UNIT.TYPE.HERO:
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

		return Utils.deepMerge(unitSettingsTpl, customSettings)
	}

	drawFighterHelpers (f) {
		this.drawBounds(f.Shield, Colors.metal).drawBounds(f.Weapon, Colors.pink);
	}

	drawHelpers () {
		this.registry.forEach(v => this.drawBounds(v));		
	}

}