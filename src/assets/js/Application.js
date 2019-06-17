
import * as PIXI from 'pixi.js';
import * as TWEEN from 'es6-tween';

import { FPS } from './Settings';

import SceneManager from './SceneManager';
import Scene from './Scene';
import LoadScene from './scenes/LoadScene';
import MainScene from './scenes/MainScene';

// console.log(PIXI);

export default class Application extends PIXI.Application {

	constructor (options) {
		super(options);
		document.body.appendChild(this.view);
		this.stage = new SceneManager(this);
		this.stop();
	}

	init () {
		this.textures = {};

		this.initScenes();

		this.ticker.add((dt) => { TWEEN.update(); this.stage.getCurrentScene().update(); });
	}

	initScenes () {
		let loadScene = new LoadScene("LoadScene");
		this.stage.add(loadScene);

		let mainScene = new MainScene("MainScene");
		this.stage.add(mainScene);

		this.stage.switchTo("LoadScene");
	}
}