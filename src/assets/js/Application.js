
import * as PIXI from 'pixi.js';
import * as TWEEN from 'es6-tween';

import { FPS } from './Settings';
import SceneManager from './SceneManager';
import Scene from './Scene';
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
		this.initTween();
		this.initScenes();

		this.ticker.add((dt) => { 
			TWEEN.update();
			this.stage.getCurrentScene().update();
		});
	}

	initTween () {

	}

	initScenes () {
		let scene = new MainScene("Main");
		this.stage.add(scene);
		scene.preload();
		scene.create();

		// This is only example
		let emptyScene = new Scene("Empty");
		this.stage.add(emptyScene);
		emptyScene.preload();
		emptyScene.create();
	}

}