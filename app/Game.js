
import Unit from './Unit.js';
import Hero from './Hero.js';
import Fight from './Fight.js';

export default class Game {

	constructor () {

		this.initObjects();
		this.initFrame();
	}

	initObjects () {
		this.fights = new Set();
	}

	initFrame () {
		this.gameStarted = false;
		this.gameStartTS = 0;
		this.frameRate = 1; // 60 fps would be great
		this.frameRateMs = 1000/this.frameRate;
	}

	initTestFight () {
		// for test only
		let BadGuy = new Unit({title:`Bad Guy`}, {lvl:10, attack:5});
		let JohnWick = new Hero({title:`John Wick`}, {lvl:10, attack:10});
		let testFight = new Fight(BadGuy, JohnWick);
		testFight.connect(this);
		console.log(testFight);
		this.fights.add(testFight)		
	}

	startGame () {
		console.log(`Start the Game!`);
		this.gameStarted = true;
		let now = performance.now();
		this.dt = 0;
		this.gameStartTS = now;
		this.lastUpdateTS = now;
		this.past = now;

		this.initTestFight();
		this.frame();
	}

	stopGame () {
		this.gameStarted = false;
	}

	frame (now) {
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

		requestAnimationFrame(this.frame.bind(this));
	}

	update () {
		this.updateObjects();
	}

	updateObjects () {
		// Update fights
		this.fights.forEach( fight => {
			fight.update();
		});
	}

	render () {
		// console.log(performance.now());
	}

	autoSuspendGame () {
		let suspendLimit = 20;
		let suspendLimitMS = suspendLimit * 1000;

		let endedFightsCnt = 0;
		this.fights.forEach( fight => {
			if( fight.ended )
				endedFightsCnt++;
		});
		let allFightsEnded = endedFightsCnt == this.fights.size;
		if( (performance.now() - this.gameStartTS) > suspendLimitMS && (allFightsEnded) ) {
			console.log(`Game autosuspended after ${suspendLimit} seconds`);
			this.stopGame();
			return true;
		}

		return false;
	}
}