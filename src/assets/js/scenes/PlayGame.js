
import { Scene } from 'phaser';
import Unit from './../Unit';
import Hero from './../Hero';

export default class PlayGame extends Scene {

	constructor () {
		super("PlayGame");
		this.initObjects();
	}

	preload () {

	}

	create () {
		let JohnWick = new Hero({name  :`John Wick`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {armorColor: 0x660066}
		}, this, 128, 128);
		// JohnWick.setAngle(45);
		// console.log(JohnWick.getByName('Weapon'));
		// console.log(JohnWick.getByName('Weapon').getLocalTransformMatrix());
		// console.log(JohnWick.getByName('Weapon').getWorldTransformMatrix());
		JohnWick.weaponPierce();

		let BadGuy = new Unit({name:`Bad Guy`, 
			attrs: {lvl:10, attack:5},
		}, this, 480, 128);

		this.fighters.add(JohnWick).add(BadGuy);
	}

	update (time, delta) {
		this.fighters.forEach( fighter => {
			// fighter.updateBoundsHelper();
			let closest = fighter.getClosestEnemy();
			// console.log(closest);
			let fighterBounds = fighter.getBounds();
			let enemyBounds   = closest.enemy.getBounds();
			if( Phaser.Geom.Intersects.RectangleToRectangle(fighterBounds, enemyBounds) ) {
				// console.log('Clash!');
				if( fighter.mover.isRunning )
					fighter.mover.stop();
				fighter.hitHp(closest.enemy);
				if( closest.enemy.isDied() ) {
					this.fighters.delete(closest.enemy);
					closest.enemy.destroy();
					let newBadGuy = new Unit({name:`Bad Guy`, 
						attrs: {lvl:10, attack:5},
					}, this, Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 480));
					this.fighters.add(newBadGuy);
				}
				// Start a fight
			}
			else if( closest.distance >= 1 ) {
				fighter.mover.moveTo(closest.enemy.x, closest.enemy.y);
			}
		});
	}
	/**
	 * Init internal scene objects
	 * @return none
	 */
	initObjects () {
		this.fighters = new Set();
	}

}