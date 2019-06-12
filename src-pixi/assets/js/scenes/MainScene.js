
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
		this.drawChild(BadGuy, 480, 128);
		this.drawBounds(BadGuy);

		// console.log(`Does JohnWick collides BadGuy?`, JohnWick.shape.collidesRectangle(BadGuy.shape));

		console.log('Initial positions of enemies', JohnWick.getGlobalPosition(), BadGuy.getGlobalPosition());
		console.log('Initial distance between enemies', Utils.distanceBetween(JohnWick, BadGuy));

		this.fighters.add(JohnWick).add(BadGuy);
	}


	update () {
		this.fighters.forEach( fighter => {
			// Example of dynamic switching scene
			this.seekAndDestroy(fighter);
			this.drawBounds(fighter);

			// if( fighter.rotation >= 2 ) {
			// 	this.app.stage.switchTo("Empty");
			// }
		});
	}

	seekAndDestroy (fighter) {
		let enemy = fighter.getClosestEnemy().enemy;
		fighter.shape.update();
		let collide = fighter.shape.collidesRectangle(enemy.shape);
		// console.log(`Does Fighter collides Enemy?`, collide);

		// If fighters too far - move towards
		// Otherwise - clash begins
		if( !collide ) {
			this.utils.followConstant(fighter, enemy, fighter.getSpeed()/FPS.target);
			fighter.rotation = this.utils.angle(fighter, enemy);			
		}
		else {
			this.clash(fighter);
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