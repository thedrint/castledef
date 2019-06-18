
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import Colors from './../Colors';
import {Game as GameSettings, FPS} from './../Settings';

import Scene from './../Scene';
import Unit from './../Unit';
import Hero from './../Hero';

import Utils from './../Utils';

export default class MainScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
		this.initObjects();
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

		this.drawCoords();

		this.heroSpawnPoint = new PIXI.Point(128, 128);

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
		this.drawChild(JohnWick, this.heroSpawnPoint.x, this.heroSpawnPoint.y);
		// JohnWick.angle = 45;
		this.drawBounds(JohnWick);
		// console.log(JohnWick);
		// JohnWick.Weapon.pierce();


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
		this.drawChild(BadGuy, this.heroSpawnPoint.x+128, this.heroSpawnPoint.y+0);
		BadGuy.angle = -135;
		this.drawBounds(BadGuy);

		// console.log(Utils.getWorldCenter(JohnWick));
		// console.log(Utils.getWorldCenter(BadGuy));
		// console.log(Utils.distance(JohnWick, BadGuy));
		// console.log(`DistanceBetween`, Utils.distanceBetween(JohnWick, BadGuy));


		// IntersectHelper.updateShape(JohnWick, BadGuy);
		// console.log(JohnWick.shape.collidesRectangle(BadGuy.shape));
		// console.log(this.getIntersects(JohnWick, BadGuy));
		
		this.fighters.add(JohnWick).add(BadGuy);
	}


	update () {
		this.fighters.forEach( fighter => {
			if( fighter.isDied() )
				return;

			this.seekAndDestroy(fighter);
			this.drawBounds(fighter)
				.drawBounds(fighter.Shield, Colors.metal)
				.drawBounds(fighter.Weapon, Colors.pink)
			;

			// Example of dynamic switching scene
			// if( fighter.isDied() ) {
			// 	this.app.stage.switchTo("GameOver");
			// }
		});
	}

	seekAndDestroy (fighter) {
		let closest = fighter.getClosestEnemy();
		if( fighter instanceof Hero && !closest ) {
			fighter.Body.alpha = 1;
			fighter.Shield.alpha = 1;

			fighter.followTo(this.heroSpawnPoint, fighter.getSpeed()/FPS.target);

			return;
		}

		let enemy = closest.enemy;

		// console.log(closest.distance);

		if( fighter instanceof Hero && closest.distance <= fighter.Weapon.getLength()*2.5 ) {
			fighter.Weapon.pierce(enemy);
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

		let enemy = closest.enemy;
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
					this.fighters.delete(enemy);
					enemy.destroy();
				}, 1000)

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
					let x = Utils.randomInt(64, appW - 64);
					let y;
					if( x <= this.heroSpawnPoint.x+128 ) {
						y = Utils.randomInt(appH - 256, appH - 64);
					}
					else {
						y = Utils.randomInt(64, appH - 64)
					}
					this.drawChild(newBadGuy, x, y);
					
					this.fighters.add(newBadGuy);

				}, 5000);
				return;
				
			}
			// Start a fight
		}
		if( closest.distance >= GameSettings.unit.size ){
			fighter.followTo(enemy, fighter.getSpeed()/FPS.target);
			return;
		}
	}
	/**
	 * Init internal scene objects
	 * @return none
	 */
	initObjects () {
		this.fighters = new Set();
	}

	drawBounds (o, color = Colors.red) {
		if( !o.boundsHelper ) {
			o.boundsHelper = new PIXI.Graphics();
			o.boundsHelper.name = 'BoundsHelper';
			this.addChild(o.boundsHelper);		
		}

		o.boundsHelper.clear();
		o.boundsHelper.lineStyle(1, color);
		o.toGlobal(new PIXI.Point(o.x, o.y));
		let b = o.getLocalBounds();
		let d = o.worldTransform.decompose(new PIXI.Transform());
		o.boundsHelper.drawShape(b);
		o.boundsHelper.setTransform(d.position.x, d.position.y, d.scale.x, d.scale.y, d.rotation, d.skew.x, d.skew.y, d.pivot.x, d.pivot.y);

		return this;
	}

	removeBounds (o) {
		if( o.boundsHelper ) {
			o.boundsHelper.destroy();
		}

		return this;
	}

	drawCoords (step = 64) {
		this.coordHelper = new PIXI.Graphics();
		this.coordHelper.name = 'CoordHelper';
		this.addChild(this.coordHelper);		
		this.coordHelper.clear();
		this.coordHelper.lineStyle(1, Colors.red);
		// Draw x
		let x = 0;
		while( x <= this.app.screen.width ) {
			this.coordHelper.moveTo(x, 0);
			this.coordHelper.lineTo(x, this.app.screen.height);
			x += step;
		}
		// Draw y
		let y = 0;
		while( y <= this.app.screen.height ) {
			this.coordHelper.moveTo(0, y);
			this.coordHelper.lineTo(this.app.screen.width, y);
			y += step;
		}

		return this;
	}

	removeCoords () {
		if( this.coordHelper ) {
			this.coordHelper.destroy();
		}

		return this;
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