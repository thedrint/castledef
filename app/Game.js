
import Unit from './Unit.js';
import Hero from './Hero.js';
import Fight from './Fight.js';

export default class Game {

	constructor () {

		this.initObjects();
		this.initFrame();
	}

	initObjects () {
		this.fighters = new Set();
		this.fights = new Set();
	}

	initFrame () {
		this.started = false;
		this.frameRate = 60; // 60 fps would be great
		this.frameRateMs = 1000/this.frameRate;
		this.frameCnt = 0;
	}

	initTestFight () {
		// for test only
		let BadGuy = new Unit({title:`Bad Guy`}, {lvl:10, attack:5});
		let JohnWick = new Hero({title:`John Wick`}, {lvl:10, attack:10});
		let BigLebowsky = new Hero({title:`Big Lebowsky`}, {lvl:20, attack:10, speed:5});
		this.fighters.add(BadGuy)
			.add(JohnWick)
			.add(BigLebowsky)
		;
		let testFight = new Fight(BadGuy, JohnWick, BigLebowsky);
		testFight.connectGame(this);
		// console.log(testFight);
		this.fights.add(testFight)		
	}

	startGame () {
		console.log(`Start the Game!`);
		let now = performance.now();
		this.dt = 0;
		this.started = now;
		this.updated = now;
		this.past = now;

		this.initTestFight();
		this.frame();
	}

	stopGame () {
		this.started = false;
	}

	frame (now) {
		if( !this.started ) {
			return;
		}

		if( this.autoSuspendGame() ) {
			return;
		}

		this.dt = now - this.past;
		this.past = now;

		let elapsed = now - this.updated;
		if( elapsed >= this.frameRateMs ) {
			this.frameCnt++;
			this.updated = now;
			this.update();
			this.render();
		}

		requestAnimationFrame(this.frame.bind(this));
	}

	update () {
		this.updateObjects();
	}

	updateObjects () {
		this.fighters.forEach( fighter => fighter.update() );
		// Update fights
		this.fights.forEach( fight => fight.update() );
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
		if( /*(performance.now() - this.started) > suspendLimitMS && */(allFightsEnded) ) {
			console.log(`Game autosuspended after ${suspendLimit} seconds`);
			this.stopGame();
			return true;
		}

		return false;
	}
}