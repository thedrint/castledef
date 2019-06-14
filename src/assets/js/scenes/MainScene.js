
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import { ApplicationSettings, FPS } from './../Settings';

import Scene from './../Scene';
import Unit from './../Unit';
import Hero from './../Hero';

import Utils from './../Utils';
// load sprites
// import KnightImage from './../../img/knight.png';

export default class MainScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
		this.initObjects();
	}

	preload () {
		// console.log(this);
	}

	create () {

		let JohnWick = new Hero({name  :`John Wick`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {armorColor: 0x660066}
		});
		this.drawChild(JohnWick, 128, 128);
		// JohnWick.angle = 45;
		// this.drawBounds(JohnWick);
		console.log(JohnWick);
		JohnWick.getWeapon().pierce();

		let BadGuy = new Unit({name:`Bad Guy`, 
			attrs: {lvl:10, attack:5},
		});
		this.drawChild(BadGuy, 128+128, 128+32);
		BadGuy.angle = 180;
		// this.drawBounds(BadGuy);
		
		this.fighters.add(JohnWick).add(BadGuy);
	}


	update () {
		this.fighters.forEach( fighter => {
			this.seekAndDestroy(fighter);
			// this.drawBounds(fighter);
			// this.drawBounds(fighter.getShield(), 0x660066);
			// this.drawBounds(fighter.getWeapon(), 0xff00ff);

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
			fighter.getChildByName('Body').alpha = 1;
			fighter.getShield().alpha = 1;
			this.moveTo(fighter, enemy);
		}
		else {
			this.clash(fighter);
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
			IntersectHelper.updateIntersectShape(fighterShapes[k]);
		}
		for( let k in enemyShapes ) {
			IntersectHelper.updateIntersectShape(enemyShapes[k]);
		}

		const checkIntersects = {
			weapon2shield : fighterShapes.weapon.shape.collidesRectangle(enemyShapes.shield.shape),
			weapon2body   : fighterShapes.weapon.shape.collidesCircle(enemyShapes.body.shape),
			shield2body   : fighterShapes.shield.shape.collidesCircle(enemyShapes.body.shape),
			shield2shield : fighterShapes.shield.shape.collidesRectangle(enemyShapes.shield.shape),
			body2body     : fighterShapes.body.shape.collidesCircle(enemyShapes.body.shape),
		};

		return checkIntersects;
	}

	clash (fighter) {

		let enemy = fighter.getClosestEnemy().enemy;
		let collides = this.getIntersects(fighter, enemy);
		let isInterects = false;

		// console.log(collides);
		if( collides.weapon2shield || collides.shield2shield ) {
			enemy.getShield().alpha = 0.5;
			isInterects = true;
		}
		else {
			enemy.getShield().alpha = 1;
		}

		if( collides.weapon2body || collides.shield2body || collides.body2body ) {
				enemy.getChildByName('Body').alpha = 0.5;
				isInterects = true;
		}
		else {
			enemy.getChildByName('Body').alpha = 1;
		}

		if( isInterects && (collides.weapon2body || collides.shield2body) ) {
			// console.log(checkIntersects);
			// console.log('Clash!');
			fighter.hitHp(enemy);
			if( enemy.isDied() ) {
				this.removeBounds(enemy);
				this.removeBounds(enemy.getWeapon());
				this.removeBounds(enemy.getShield());
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