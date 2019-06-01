
import Unit from './Unit.js';
import Hero from './Hero.js';

export default class Fight {
	constructor (...fighters) {
		this.started = false;
		this.ended = false;
		this.winner = undefined;

		this.fighters = new Set(fighters);
	}

	connect (game) {
		this.game = game;
	}

	update () {
		if( !this.started ) {
			this.started = true;
			console.log(`Start fight`);
			console.log(this.fighters);
		}

		if( !this.ended ) {
			// Every frame check that units can hits each other
			this.fighters.forEach( (fighter, again, enemies) => {
				if( fighter.isDied() )
					return;
				// cycle through all enemies in a fight and hit their
				enemies.forEach( enemy => {
					// pass itself
					if( enemy == fighter )
						return;

					fighter.hitHp(enemy);
					if( enemy.isDied() ) {
						this.ended = true;
						this.winner = fighter;
						console.log(`Fight is over, winner is ${fighter.title}`);
					}
				})
			});
		}
	}
}