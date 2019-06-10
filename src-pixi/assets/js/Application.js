
import * as PIXI from 'pixi.js';
import { FPS } from './Settings';
import SceneManager from './SceneManager';
import Scene from './Scene';
import MainScene from './scenes/MainScene';


export default class Application extends PIXI.Application {

	constructor (options) {
		super(options);
		document.body.appendChild(this.view);
		let scenes = new SceneManager(this);
		this.stage = scenes;
		this.stop();
	}

	init () {
		this.initScenes();

		this.ticker.add(() => { this.stage.getCurrentScene().update(); });
	}

	initScenes () {
		let scene = new MainScene("Main");
		this.stage.add(scene);
		scene.x= 0;
		scene.y= 0;
		scene.preload();
		scene.create();

		// This is only example
		let emptyScene = new Scene("Empty");
		this.stage.add(emptyScene);
		emptyScene.preload();
		emptyScene.create();
	}

}