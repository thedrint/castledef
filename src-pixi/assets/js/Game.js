
import Application from './Application';

export class Game {

	constructor (options) {
		this.app = new Application(options);
		document.body.appendChild(this.app.view);
		this.app.stop();
	}

	startGame () {
		this.app.init();
		this.app.start();
	}

	stopGame () {
		this.app.stop();
	}
}