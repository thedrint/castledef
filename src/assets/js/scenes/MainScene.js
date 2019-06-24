
import * as FERMAT from '@mathigon/fermat';
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import Colors from './../Colors';
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

import Utils from './../Utils';

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

		let heroSettings = {
			name  :`John Wick`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {
				colors: {armor: Colors.purple},
				textures: {
					weapon: this.app.textures.Sword, 
					shield: this.app.textures.Shield, 
				},
			}
		};
		let JohnWick = new Hero(heroSettings);
		JohnWick.spawnPoint = new PIXI.Point(128, 128);
		this.drawChild(JohnWick, JohnWick.spawnPoint.x, JohnWick.spawnPoint.y);
		// JohnWick.angle = 45;
		this.drawBounds(JohnWick);
		// console.log(JohnWick);
		// JohnWick.Weapon.pierce();
		
		// Let add another hero
		
		heroSettings = {
			name  :`Baba Yaga`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {
				colors: {armor: Colors.monokai},
				textures: {
					weapon: this.app.textures.Sword, 
					shield: this.app.textures.Shield, 
				},
			}
		};
		let BabaYaga = new Hero(heroSettings);
		BabaYaga.spawnPoint = new PIXI.Point(JohnWick.spawnPoint.x+160, JohnWick.spawnPoint.y+256);
		this.drawChild(BabaYaga, BabaYaga.spawnPoint.x, BabaYaga.spawnPoint.y);
		// JohnWick.angle = 45;
		this.drawBounds(BabaYaga);


		let enemySettings = {name:`Bad Guy`, 
			attrs: {lvl:10, attack:5},
			model: {
				textures: {
					weapon: this.app.textures.Sword,
					shield: this.app.textures.RoundShield,
				},
			},
		};
		let BadGuy = new Unit(enemySettings);
		this.drawChild(BadGuy, JohnWick.spawnPoint.x+256, JohnWick.spawnPoint.y+32);
		BadGuy.angle = -135;
		this.drawBounds(BadGuy);

		// console.log(JohnWick.position);
		// console.log(Utils.getWorldCenter(JohnWick));
		// console.log(Utils.getWorldCenter(BadGuy));
		// console.log(Utils.distance(JohnWick, BadGuy));
		// console.log(`DistanceBetween`, Utils.distanceBetween(JohnWick, BadGuy));


		// IntersectHelper.updateShape(JohnWick, BadGuy);
		// console.log(JohnWick.shape.collidesRectangle(BadGuy.shape));
		// console.log(this.getIntersects(JohnWick, BadGuy));
		
		this.fighters
			.add(JohnWick)
			.add(BabaYaga)
			.add(BadGuy)
		;

		// Add some obstacles to scene
		let cratesOnScene = [
			[128+64, 128],
			[128+128+64, 128+32],
			// [256+192, 256],
			// [256+64, 256+128],
		];
		cratesOnScene.forEach( (coords, i) => {
			let [x,y] = coords;
			let crate = new Crate({
				name: `Crate #${i}`,
				model: {
					texture: this.app.textures.Crate,
				},
			});
			this.drawChild(crate, x, y);
			// crate.angle = Utils.randomInt(0, 90);
			this.registry.add(crate);
		});


		// Create parties for our enemies
		let heroPartyUnits = new Set([BabaYaga]);
		let HeroParty = new Party({name:'Heroes', faction: 'Good'}, JohnWick, new Set([BabaYaga]));
		let EnemyParty = new Party({name:'Enemies', faction: 'Evil'}, BadGuy);
		this.party
			.add(HeroParty)
			.add(EnemyParty)
		;

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
			this.getMap(true);
			pathCoords = JohnWick.getPathTo(BadGuy);
		}

		let res = Utils.perfTest('create map and calculate path', 1, testCode);
		console.log(`${res.name} in ${res.result.duration/res.n}ms`);

		this.drawPath(JohnWick, Colors.pink, 16, ...pathCoords);

		console.table([
			['checkInMainPoly', Utils.sumPerf('checkInMainPoly')],
			['checkInTooClose', Utils.sumPerf('checkInTooClose')],
			['checkMiddlePointInside', Utils.sumPerf('checkMiddlePointInside')],
			['checkEdgesForCross', Utils.sumPerf('checkEdgesForCross')],
			['InLineOfSight', Utils.sumPerf('InLineOfSight')],
			['selfCrossing', Utils.sumPerf('selfCrossing')],
			['vertexCollect', Utils.sumPerf('vertexCollect')],
			['createGraph', Utils.sumPerf('createGraph')],
			['calculatePath', Utils.sumPerf('calculatePath')],
			['AstarAlgorithm', Utils.sumPerf('AstarAlgorithm')],
			['pointInside', Utils.sumPerf('pointInside')],
			['LineSegmentsCross', Utils.sumPerf('LineSegmentsCross')],
		]);

		// console.log(this.map);

		// console.log(this.map.InLineOfSight(JohnWick, BadGuy));
		// console.log(this.map.InLineOfSight(BadGuy, BabaYaga));

		// let testForeach = () => {
		// 	Utils.range(10000).forEach((i) => {i++});
		// }
		// res = Utils.perfTest('testForeach', 1, testForeach);
		// console.log(`${res.name} in ${res.result.duration/res.n}ms`);

		// let testFor = () => {
		// 	for( let i of Utils.range(10000) )
		// 		i++;
		// }
		// res = Utils.perfTest('testFor', 1, testFor);
		// console.log(`${res.name} in ${res.result.duration/res.n}ms`);

		// performance.mark('testCreateGraph0');
		// Utils.range(1).forEach(testCode);
		// performance.measure('testCreateGraph0 measure', 'testCreateGraph0');
		// console.log(performance.getEntriesByName(`testCreateGraph0 measure`)[0])


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

					let newBadGuy = new Unit(enemySettings);
					
					let appW = this.app.screen.width;
					let appH = this.app.screen.height;
					let x = Utils.randomInt(256, appW - 64);
					let y = Utils.randomInt(64, appH - 64);
					this.drawChild(newBadGuy, x, y);
					
					this.fighters.add(newBadGuy);

					this.party.get('Enemies').hireUnit(newBadGuy);
				}, 5000);

				return;
				
			}
		}

		let strategy = fighter.pf.chooseAction();
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
			this.map = new PolygonMap();
			let mapCoords = Utils.flatToCoords([
					0,0,
					this.app.screen.width, 0,
					this.app.screen.width, this.app.screen.height,
					0, this.app.screen.height
			]);
			let mapPolygon = new Polygon(...mapCoords);
			this.map.polygons.push(mapPolygon);
			this.registry.forEach( p => {
				if( p instanceof Unit )
					return;

				let poly = new Polygon(...Utils.flatToCoords(p.shape.vertices));
				this.map.polygons.push(poly);
			});

			this.map.createGraph();		
	}

	getMap (recreate = false) {
		if( !this.map || recreate ) 
			this.initMap();

		return this.map;
	}

	testObjects () {
		let rectCont = new PIXI.Container();
		rectCont.name = 'Container for SomeRect';
		let rect = Scene.createShape(new PIXI.Rectangle(0, 0, 64, 64), Colors.pink);
		rect.name = 'Some Rect';
		rectCont.addChild(rect);
		rectCont.shape = new IntersectHelper.Rectangle(rectCont);
		this.drawChild(rectCont, 128+64, 128+64);
		// rectCont.pivot.x = rectCont.width/2;
		// rectCont.pivot.y = rectCont.height/2;
		rectCont.angle += 30;

		rectCont.x +=16;

		let sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
		sprite.name = 'SomeSprite';
		sprite.anchor.set(0.5);
		sprite.shape = new IntersectHelper.Rectangle(sprite);
		this.drawChild(sprite, 256, 256);
		// sprite.angle += 45;

		console.log(`rectCont WC`, Utils.getWorldCenter(rectCont));
		console.log(`rect WC`, Utils.getWorldCenter(rect));
		console.log(`sprite WC`, Utils.getWorldCenter(sprite));

		IntersectHelper.updateShape(rectCont, sprite);
		console.log(`Does rectCont and sprite collides?`, rectCont.shape.collidesRectangle(sprite.shape));
	}
}