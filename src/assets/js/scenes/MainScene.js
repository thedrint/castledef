
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
		// JohnWick.getWeapon().pierce();

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
		let closest = fighter.getClosestEnemy();
		if( !closest ) {
			fighter.getBody().alpha = 1;
			fighter.getShield().alpha = 1;

			let spawnPoint = new PIXI.Point(128, 128);
			Utils.follow(fighter, spawnPoint, fighter.getSpeed()/FPS.target);
			fighter.rotation = Utils.getAngle(fighter, spawnPoint);

			return;
		}

		let enemy = closest.enemy;

		// console.log(closest.distance);

		if( closest.distance <= fighter.getWeapon().getLength()*2 ) {
			fighter.getWeapon().pierce(enemy);
		}

		// IntersectHelper.updateIntersectShape(fighter);
		// IntersectHelper.updateIntersectShape(enemy);
		// let collide = fighter.shape.collidesRectangle(enemy.shape);
		let collide = ( closest.distance <= 96 );

		// If fighters too far - move towards
		// Otherwise - clash begins
		if( !collide ) {
			fighter.getBody().alpha = 1;
			fighter.getShield().alpha = 1;
			this.moveTo(fighter, enemy);
		}
		else {
			this.clash(fighter);
		}
	}

	moveTo (fighter, enemy) {
			Utils.followConstant(fighter, enemy, fighter.getSpeed()/FPS.target);
			fighter.rotation = Utils.angle(fighter, enemy);	
	}

	getIntersects (fighter, enemy) {

		let fighterShapes = {
			weapon : fighter.getWeapon(),
			shield : fighter.getShield(),
			body   : fighter.getBody(),
		};
		let enemyShapes   = {
			weapon : enemy.getWeapon(),
			shield : enemy.getShield(),
			body   : enemy.getBody(),
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
		if( collides.weapon2shield ) {
			enemy.getShield().alpha = 0.2;
			isInterects = true;
		}
		else {
			enemy.getShield().alpha = 1;
		}

		if( collides.weapon2body ) {
				enemy.getBody().alpha = 0.2;
				isInterects = true;
		}
		else {
			enemy.getBody().alpha = 1;
		}

		if( isInterects && collides.weapon2body ) {
			// console.log(checkIntersects);
			// console.log('Clash!');
			fighter.hitHp(enemy);
			if( enemy.isDied() ) {
				this.removeBounds(enemy);
				this.removeBounds(enemy.getWeapon());
				this.removeBounds(enemy.getShield());
				this.fighters.delete(enemy);
				enemy.destroy();

				setTimeout(() => {
					let newBadGuy = new Unit({name:`Bad Guy`, 
						attrs: {lvl:10, attack:5},
					}, this, );
					
					let randomPoint = {
						x: Utils.randomInt(128+64, ApplicationSettings.width),
						y: Utils.randomInt(128+64, ApplicationSettings.height),
					};
					this.drawChild(newBadGuy, randomPoint.x, randomPoint.y);
					
					this.fighters.add(newBadGuy);
				}, 5000);
			}
			// Start a fight
		}
		else {
			// this.moveTo(fighter, enemy);
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