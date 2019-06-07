
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
		let JohnWick = new Hero(this, 128, 128, 
			{name:`John Wick`, immortal:true}, 
			{lvl:10, attack:10}
		);
		// JohnWick.setAngle(90);

		let BadGuy = new Unit(this, 480, 128, 
			{name:`Bad Guy`}, 
			{lvl:10, attack:5}
		);
		// BadGuy.setAngle(-90);

		this.fighters.add(JohnWick).add(BadGuy);
	}

	update (time, delta) {
		this.fighters.forEach( fighter => {
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
					let newBadGuy = new Unit(this, Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 480), 
						{name:`Bad Guy`}, 
						{lvl:10, attack:5}
					);
					this.fighters.add(newBadGuy);
				}
				// Start a fight
			}
			else if( closest.distance >= 1 ) {
				fighter.mover.moveTo(closest.enemy.x, closest.enemy.y);
			}
		});
	}

	initObjects () {
		this.fighters = new Set();
	}

}