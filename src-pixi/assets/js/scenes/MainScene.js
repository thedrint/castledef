
import * as PIXI from 'pixi.js';
import Scene from './../Scene';
// import Unit from './../Unit';
// import Hero from './../Hero';

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
		// 
		let man = new PIXI.Container();
		man.name = 'Man';
		this.addChild(man);

		let graphics = new PIXI.Graphics();
		
		let head = new PIXI.Container();
		graphics.beginFill(0x000000);
		graphics.drawCircle(0, 0, 16);
		graphics.endFill();
		head.addChild(graphics);
		man.addChild(head);
		head.setTransform(16,16);

		let body = new PIXI.Container();
		graphics = new PIXI.Graphics();
		graphics.beginFill(0x888888);
		graphics.drawRect(0, 0, 32, 48);
		graphics.endFill();
		body.addChild(graphics);
		man.addChild(body);
		body.setTransform(0,32);

		// this.addChild(knight);
		// this.fighters.add(knight);

		console.log('Scene bounds:', this.getBounds());
		console.log('Man bounds:', man.getBounds());
		console.log('head bounds:', head.getBounds());

		this.drawBounds(man);
		// let bounds = new PIXI.Graphics();
		// bounds.lineStyle(1, 0xff0000);
		// bounds.drawShape(man.getBounds());

		// this.addChild(bounds);

		// let JohnWick = new Hero({name  :`John Wick`, 
		// 	attrs : {lvl:10, attack:10, immortal:true},
		// 	model: {armorColor: 0x660066}
		// }, this, 64, 64);
		// JohnWick.weaponPierce();


		// let BadGuy = new Unit({name:`Bad Guy`, 
		// 	attrs: {lvl:10, attack:5},
		// }, this, 480, 128);

		// this.fighters.add(JohnWick).add(BadGuy);
	}

	update () {
		let man = this.getChildByName('Man');
		if( man.x <= 480 )
			man.x += 1;

		this.drawBounds(man);
		// this.fighters.forEach( fighter => {
		// 	fighter.rotation += 0.01;
		// 	// Example of dynamic switching scene
		// 	if( fighter.rotation >= 2 ) {
		// 		this.app.stage.switchTo("Empty");
		// 	}
		// });

	}

	drawBounds (anyObject, color = 0xff0000) {
		if( !anyObject.boundsHelper ) {
			anyObject.boundsHelper = new PIXI.Graphics();
			anyObject.boundsHelper.name = 'BoundsHelper';
			this.addChild(anyObject.boundsHelper);		
		}

		anyObject.boundsHelper.clear();
		anyObject.boundsHelper.lineStyle(1, color);
		anyObject.boundsHelper.drawShape(anyObject.getBounds());
	}

	clash (fighter) {
		let closest = fighter.getClosestEnemy();
		let enemy = closest.enemy;
		// console.log(closest);
		let fighterBounds = fighter.getBounds();
		let enemyBounds   = enemy.getBounds();

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

		console.log(fighterGeom.shield);
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
				}, this, Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 480));
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

}