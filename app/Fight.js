
import Unit from './Unit.js';
import Hero from './Hero.js';

export default class Fight {
	constructor (...fighters) {
		this.started = false;
		this.ended = false;
		this.winner = undefined;

		this.fighters = new Set(fighters);
	}

	connectGame (game) {
		this.game = game;
	}

	update () {
		if( !this.started ) {
			this.started = true;
			console.log(`Start fight`, this);
			// console.log(this.fighters);
		}

		if( !this.ended ) {
			// Every frame check that units can hits each other
			this.fighters.forEach( (fighter, again, enemies) => {
				if( fighter.isDied() )
					return;

				if( !fighter.isReady() )
					return;
				// cycle through all enemies in a fight and hit their
				enemies.forEach( enemy => {
					// pass itself
					if( enemy == fighter )
						return;
					if( enemy.isDied() )
						return;

					fighter.hitHp(enemy);
					if( enemy.isDied() ) {
						console.log(`${fighter.title} killed ${enemy.title}`);
					}
				})
			});
			if( this.isEnded() ) {
				this.ended = true;
				this.winner = this.whoIsWinner();
				console.log(`And winner is ${this.winner.title}!`);
			}
		}
	}

	isEnded () {
		let deadCnt = 0;
		this.fighters.forEach( (fighter) =>  {
			if( fighter.isDied() )
				deadCnt++;
		});
		if( (this.fighters.size - deadCnt) <= 1 )
			return true;
		else
			return false;
	}

	whoIsWinner () {
		let winner = undefined;
		for( const fighter of this.fighters ) {
			if( !fighter.isDied() ) {
				winner = fighter;
				break;		
			}
		}

		return winner;
	}
}