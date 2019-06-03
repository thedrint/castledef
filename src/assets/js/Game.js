
// import Engine from './Engine.js';
import Unit from './Unit.js';
import Hero from './Hero.js';
import Fight from './Fight.js';

export default class Game {

	constructor () {

		// this.engine = new Engine();
		this.initObjects();
		this.initFrame();
	}

	initObjects () {
		this.fighters = new Set();
		this.fights = new Set();
	}

	initFrame () {
		this.started = undefined;
		this.stopped = undefined;
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

	stopGame (reasonMessage) {
		this.stopped = performance.now();
		console.log(reasonMessage);
	}

	frame (now) {
		if( !this.started || this.stopped ) {
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
			console.log(this.frameCnt);
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
		// Update fighters
		this.fighters.forEach( fighter => fighter.update() );
		// Update fights
		this.fights.forEach( fight => fight.update() );
	}

	render () {
		// console.log(performance.now());
	}

	updateLastAction () {
		this.lastActionFrame = this.frameCnt;
	}

	autoSuspendGame () {
		let suspendFramesThreshold = this.frameRate+20;
		if( this.frameCnt - this.lastActionFrame >= suspendFramesThreshold ) {
			this.stopGame(`Game autosuspended`);
			return true;
		}

		/*
		let endedFightsCnt = 0;
		this.fights.forEach( fight => {
			if( fight.ended )
				endedFightsCnt++;
		});
		let allFightsEnded = endedFightsCnt == this.fights.size;
		if( allFightsEnded ) {
			console.log(`Game autosuspended after ${suspendLimit} seconds`);
			this.stopGame();
			return true;
		}
		*/
	
		return false;
	}
}