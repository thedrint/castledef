
import * as PIXI from 'pixi.js';

import { ApplicationSettings } from './../Settings';

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

		console.log(JohnWick.getGlobalPosition(), BadGuy.getGlobalPosition());
		console.log(Utils.distanceBetween(JohnWick, BadGuy));

		this.fighters.add(JohnWick).add(BadGuy);
	}


	update () {
		this.fighters.forEach( fighter => {
			// Example of dynamic switching scene
			this.seekAndDestroy(fighter);
			// if( fighter.rotation >= 2 ) {
			// 	this.app.stage.switchTo("Empty");
			// }
		});
	}

	seekAndDestroy (fighter) {
		let enemy = fighter.getClosestEnemy().enemy;
		this.utils.followConstant(fighter, enemy, 1);
		fighter.rotation = this.utils.angle(fighter, enemy);
	}

	clash (fighter) {

		let closest = fighter.getClosestEnemy();
		let enemy = closest.enemy;

		let fighterGeom = {
			weapon : fighter.getWeapon().getBlade().geom,
			shield : fighter.getShield().getPlate().geom,
			body   : fighter.getByName(`Body`).geom,
		};
		let enemyGeom   = {
			weapon : enemy.getWeapon().getBlade().geom,
			shield : enemy.getShield().getPlate().geom,
			body   : enemy.getByName(`Body`).geom,
		}
		let checkIntersects = {
			weapon2shield: Phaser.Geom.Intersects.LineToLine(fighterGeom.weapon, enemyGeom.shield),
			weapon2body: Phaser.Geom.Intersects.LineToCircle(fighterGeom.weapon, enemyGeom.body),
			shield2body: Phaser.Geom.Intersects.LineToCircle(fighterGeom.shield, enemyGeom.body),
			body2body: Phaser.Geom.Intersects.CircleToCircle(fighterGeom.body, enemyGeom.body),
		};

		let isInterects = false;
		for( let check in checkIntersects ) {
			if( checkIntersects[check] ) {
				isInterects = true;
				break;
			}
		}
		if( isInterects ) {
			console.log(checkIntersects);
			// console.log('Clash!');
			fighter.hitHp(enemy);
			if( enemy.isDied() ) {
				this.fighters.delete(enemy);
				enemy.destroy();

				let newBadGuy = new Unit({name:`Bad Guy`, 
					attrs: {lvl:10, attack:5},
				}, this, );
				
				let randomPoint = {
					x: Utils.random(0, ApplicationSettings.width),
					y: Utils.random(0, ApplicationSettings.height),
				};
				this.drawChild(BadGuy, randomPoint.x, randomPoint.y);
				
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

}