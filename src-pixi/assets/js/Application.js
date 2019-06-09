
import * as PIXI from 'pixi.js';
import { FPS } from './Settings';

// load sprites
import KnightImage from './../img/knight.png';

export default class Application extends PIXI.Application {

	constructor (options) {
		super(options);
		document.body.appendChild(this.view);
		this.stop();
	}

	init () {

		let knight = PIXI.Sprite.from(KnightImage);
		knight.anchor.set(0.5);
		knight.x = app.screen.width / 2;
		knight.y = app.screen.height / 2;

		this.stage.addChild(knight);
	}

}