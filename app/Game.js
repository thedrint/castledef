
import Unit from './Unit.js';
import Hero from './Hero.js';

export default class Game {

	constructor () {
		this.gameStarted = false;
		this.gameStartTS = 0;
	}

	startGame () {
		console.log(`Start the Game!`);
		this.gameStarted = true;
		this.gameStartTS = performance.now();
		this.nextFrame();
	}

	stopGame () {
		this.gameStarted = false;
	}

	nextFrame () {
		if( !this.gameStarted ) {
			return;
		}

		if( this.autoSuspendGame() ) {
			return;
		}

		requestAnimationFrame(this.nextFrame.bind(this));
		this.render();
	}

	render () {
		// console.log(performance.now());
		this.battleFrame();
	}

	autoSuspendGame () {
		let suspendLimit = 2;
		let suspendLimitMS = suspendLimit * 1000;
		if( (performance.now() - this.gameStartTS) > suspendLimitMS && (!this.battleEnded) ) {
			console.log(`Game autosuspended after ${suspendLimit} seconds`);
			this.stopGame();
			return true;
		}

		return false;
	}

	battleFrame () {
		if( !this.battleStarted ) {
			this.battleStarted = true;
			this.Enemy = new Unit({title:`Bad Guy`}, {lvl:10, attack:5});
			this.Hero = new Hero({title:`John Wick`}, {lvl:10, attack:10});
			console.log(`Start battle`);
			console.log(this.Enemy, this.Hero);
			return;
		}

		if( !this.battleEnded ) {
			// Every frame units hits each other
			this.Hero.hitHp(this.Enemy);
			this.Enemy.hitHp(this.Hero);
			console.log(`${this.Enemy.title} has ${this.Enemy.attrs.hp}, ${this.Hero.title} has ${this.Hero.attrs.hp}`);
			if( this.Hero.isDied() || this.Enemy.isDied() ) {
				this.battleEnded = true;
				let winner = this.Hero.isDied() ? `${this.Enemy.title}` : `${this.Hero.title}`;
				console.log(`Battle is over, winner is ${winner}`);
				this.stopGame();
			}
		}
		
	}
}