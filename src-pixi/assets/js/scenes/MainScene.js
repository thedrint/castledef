
import Scene from './../Scene';
import Unit from './../Unit';
import Hero from './../Hero';

export default class MainScene extends Scene {

	constructor (options) {
		super(options);
		this.initObjects();
	}

	preload () {

	}

	create () {
		let JohnWick = new Hero({name  :`John Wick`, 
			attrs : {lvl:10, attack:10, immortal:true},
			model: {armorColor: 0x660066}
		}, this, 64, 64);
		// JohnWick.setAngle(45);
		// console.log(JohnWick.getByName('Weapon'));
		// console.log(JohnWick.getByName('Weapon').getLocalTransformMatrix());
		// console.log(JohnWick.getByName('Weapon').getWorldTransformMatrix());
		JohnWick.weaponPierce();
		// JohnWick.updateBoundsHelper(JohnWick);
		// JohnWick.updateBoundsHelper(JohnWick.getWeapon());


		let BadGuy = new Unit({name:`Bad Guy`, 
			attrs: {lvl:10, attack:5},
		}, this, 480, 128);
		// BadGuy.updateBoundsHelper(BadGuy);
		// BadGuy.updateBoundsHelper(BadGuy.getWeapon());

		this.fighters.add(JohnWick).add(BadGuy);
	}

	update (time, delta) {
		this.fighters.forEach( fighter => {
			// fighter.updateBoundsHelper(fighter);
			// fighter.updateBoundsHelper(fighter.getWeapon());
			this.clash(fighter);
		});
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