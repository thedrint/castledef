
import Unit from './Unit.js';
import Hero from './Hero.js';

export default class Game {

	constructor () {
		this.gameStarted = false;
		this.gameStartTS = 0;
		this.frameRate = 1; // 60 fps
		this.frameRateMs = 1000/this.frameRate;
	}

	startGame () {
		console.log(`Start the Game!`);
		this.gameStarted = true;
		let now = performance.now();
		this.dt = 0;
		this.gameStartTS = now;
		this.lastUpdateTS = now;
		this.past = now;
		this.nextFrame();
	}

	stopGame () {
		this.gameStarted = false;
	}

	nextFrame (now) {
		if( !this.gameStarted ) {
			return;
		}

		if( this.autoSuspendGame() ) {
			return;
		}

		this.dt = now - this.past;
		// console.log(this.dt);
		this.past = now;

		this.elapsedTime = now - this.lastUpdateTS;
		if( this.elapsedTime >= this.frameRateMs ) {
			this.lastUpdateTS = now;
			this.update();
			this.render();
		}

		requestAnimationFrame(this.nextFrame.bind(this));
	}

	update () {
		this.battleFrame();
	}

	render () {
		// console.log(performance.now());
	}

	autoSuspendGame () {
		let suspendLimit = 20;
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