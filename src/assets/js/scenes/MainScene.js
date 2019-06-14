
import * as PIXI from 'pixi.js';

import { ApplicationSettings, FPS } from './../Settings';

import Scene from './../Scene';
import Unit from './../Unit';
import Hero from './../Hero';

import Utils from './../Utils';
// load sprites
import KnightImage from './../../img/knight.png';

export default class MainScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
		this.initObjects();
	}

	preload () {
		// console.log(this);
	}

	create () {
		// let knight = PIXI.Sprite.from(KnightImage);
		// knight.anchor.set(0.5);
		// knight.x = 96;
		// knight.y = 96;
		// this.addChild(knight);
		// this.fighters.add(knight);

		let JohnWick = new Hero({name  :`John Wick`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {armorColor: 0x660066}
		});
		this.drawChild(JohnWick, 128, 128);
		// JohnWick.angle = 45;
		this.drawBounds(JohnWick);
		console.log(JohnWick);
		JohnWick.getWeapon().pierce();

		let BadGuy = new Unit({name:`Bad Guy`, 
			attrs: {lvl:10, attack:5},
		});
		this.drawChild(BadGuy, 256, 164);
		BadGuy.angle = -135;
		this.drawBounds(BadGuy);

		// console.log(`Does JohnWick collides BadGuy?`, JohnWick.shape.collidesRectangle(BadGuy.shape));

		console.log('Initial positions of enemies', JohnWick.getGlobalPosition(), BadGuy.getGlobalPosition());
		console.log('Initial distance between enemies', Utils.distanceBetween(JohnWick, BadGuy));

		this.fighters.add(JohnWick).add(BadGuy);
	}


	update () {
		this.fighters.forEach( fighter => {
			if( fighter.name == 'John Wick' ) {
				let enemy = fighter.getClosestEnemy().enemy;
				let collides = this.getIntersects(fighter, enemy);
				console.log(collides.weapon2shield);
				if( collides.weapon2shield ) 
					enemy.getChildByName('Body').alpha = 0.5;
				else
					enemy.getChildByName('Body').alpha = 1;

				// console.log(collides);
			}
			// this.seekAndDestroy(fighter);
			this.drawBounds(fighter);

			// Example of dynamic switching scene
			// if( fighter.rotation >= 2 ) {
			// 	this.app.stage.switchTo("Empty");
			// }
		});
	}

	seekAndDestroy (fighter) {
		let enemy = fighter.getClosestEnemy().enemy;
		fighter.shape.update();
		let collide = fighter.shape.collidesRectangle(enemy.shape);

		// If fighters too far - move towards
		// Otherwise - clash begins
		if( !collide ) {
			// this.moveTo(fighter, enemy);
		}
		else {
			// this.clash(fighter);
		}
	}

	moveTo (fighter, enemy) {
			this.utils.followConstant(fighter, enemy, fighter.getSpeed()/FPS.target);
			fighter.rotation = this.utils.angle(fighter, enemy);		
	}

	getIntersects (fighter, enemy) {

		let fighterShapes = {
			weapon : fighter.getWeapon(),
			shield : fighter.getShield(),
			body   : fighter.getChildByName(`Body`),
		};
		let enemyShapes   = {
			weapon : enemy.getWeapon(),
			shield : enemy.getShield(),
			body   : enemy.getChildByName(`Body`),
		}

		for( let k in fighterShapes ) {
			fighterShapes[k].shape.set({center:fighterShapes[k].getGlobalPosition(), rotation: fighterShapes[k]});
		}
		for( let k in enemyShapes ) {
			enemyShapes[k].shape.set({center:enemyShapes[k].getGlobalPosition(), rotation: enemyShapes[k]});
		}

		const checkIntersects = {
			weapon2shield : fighterShapes.weapon.shape.collidesRectangle(enemyShapes.shield.shape),
			weapon2body   : fighterShapes.weapon.shape.collidesCircle(enemyShapes.body.shape),
			shield2body   : fighterShapes.shield.shape.collidesCircle(enemyShapes.body.shape),
			shield2shield : fighterShapes.shield.shape.collidesRectangle(enemyShapes.shield.shape),
			body2body     : fighterShapes.body.shape.collidesCircle(enemyShapes.body.shape),
		};

		return checkIntersects;

		let isInterects = false;
		for( let check in checkIntersects ) {
			if( checkIntersects[check] ) {
				isInterects = true;
				break;
			}
		}
	}

	clash (fighter) {

		let closest = fighter.getClosestEnemy();
		let enemy = closest.enemy;

		let fighterShapes = {
			weapon : fighter.getWeapon().getBlade().shape,
			shield : fighter.getShield().getPlate().shape,
			body   : fighter.getChildByName(`Body`).shape,
		};
		let enemyShapes   = {
			weapon : enemy.getWeapon().getBlade().shape,
			shield : enemy.getShield().getPlate().shape,
			body   : enemy.getChildByName(`Body`).shape,
		}

		console.log(fighterShapes.weapon);
		let checkIntersects = {
			weapon2shield : fighterShapes.weapon.collidesRectangle(enemyShapes.shield),
			weapon2body   : fighterShapes.weapon.collidesCircle(enemyShapes.body),
			shield2body   : fighterShapes.shield.collidesCircle(enemyShapes.body),
			shield2shield : fighterShapes.shield.collidesRectangle(enemyShapes.shield),
			body2body     : fighterShapes.body.collidesCircle(enemyShapes.body),
		};

		let isInterects = false;
		for( let check in checkIntersects ) {
			if( checkIntersects[check] ) {
				isInterects = true;
				break;
			}
		}
		if( isInterects ) {
			// console.log(checkIntersects);
			// console.log('Clash!');
			fighter.hitHp(enemy);
			if( enemy.isDied() ) {
				this.removeBounds(enemy);
				this.fighters.delete(enemy);
				enemy.destroy();

				let newBadGuy = new Unit({name:`Bad Guy`, 
					attrs: {lvl:10, attack:5},
				}, this, );
				
				let randomPoint = {
					x: Utils.random(0, ApplicationSettings.width),
					y: Utils.random(0, ApplicationSettings.height),
				};
				this.drawChild(newBadGuy, randomPoint.x, randomPoint.y);
				
				this.fighters.add(newBadGuy);
			}
			// Start a fight
		}
		else {
			this.moveTo(fighter, enemy);
		}

	}
	/**
	 * Init internal scene objects
	 * @return none
	 */
	initObjects () {
		this.fighters = new Set();
	}

	drawBounds (displayObject, color = 0xff0000) {
		if( !displayObject.boundsHelper ) {
			displayObject.boundsHelper = new PIXI.Graphics();
			displayObject.boundsHelper.name = 'BoundsHelper';
			this.addChild(displayObject.boundsHelper);		
		}

		displayObject.boundsHelper.clear();
		displayObject.boundsHelper.lineStyle(1, color);
		displayObject.boundsHelper.drawShape(displayObject.getBounds());
	}

	removeBounds (displayObject) {
		if( displayObject.boundsHelper ) {
			displayObject.boundsHelper.destroy();
		}
	}

}