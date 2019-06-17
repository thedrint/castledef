
import * as PIXI from 'pixi.js';

import Colors from './../Colors';
import { ApplicationSettings, FPS, GameSettings } from './../Settings';

import Scene from './../Scene';

import Utils from './../Utils';
// load sprites
// import KnightImage from './../../img/knight.png';
import SwordImage from './../../img/Sword.svg';
import ShieldImage from './../../img/Shield.svg';
import RoundShieldImage from './../../img/RoundShield.svg';

export default class LoadScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
	}

	preload () {
		this.resourceLoadingProgress = 0;
		console.log('SceneLoad preload()');
		let loader = PIXI.Loader.shared;
		const textures = {};

		loader.add('Sword', SwordImage);
		loader.add('Shield', ShieldImage);
		loader.add('RoundShield', RoundShieldImage);

		loader.load((loader, resources) => {
			textures.Sword = resources.Sword.texture;
			textures.Shield = resources.Shield.texture;
			textures.RoundShield = resources.RoundShield.texture;
			Object.assign(this.app.textures, textures);
		});

		loader.onProgress.add((loader) => {
			// this.resourceLoadingProgress = loader.progress;
		});
	}

	create () {
		console.log('SceneLoad create()');

		this.progressbar();
	}

	update () {
		// console.log(`LoadScene update(). Progress loading resources is ${this.resourceLoadingProgress}`);
		this.resourceLoadingProgress += 0.5;
		this.progressbar(this.resourceLoadingProgress);

		if( this.resourceLoadingProgress >= 100 ) {
			console.log(`Switching to MainScene`);
			//TODO: make switch through animation/fade out/blur/etc
			this.app.stage.switchTo("MainScene");
		}
	}

	progressbar (loadingProgress = 0) {
		if( !this.progressBar ) {
			let progressBar = new PIXI.Container();
			progressBar.name = 'Progressbar';
			let w = this.app.screen.width*0.6;
			let h = 40;
			let r = 10;
			let backShape = new PIXI.RoundedRectangle(0, 0, w, h, r);
			let progShape = new PIXI.RoundedRectangle(0, 0, 1, h, r);
			let background = Scene.createShape(backShape, Colors.brown);
			background.name = 'Background';
			let progress = Scene.createShape(progShape, Colors.green);
			progress.name = 'Progress';

			progressBar.addChild(background, progress);
			progress.visible = false;
			this.addChild(progressBar);

			progressBar.x = (this.app.screen.width - w) / 2;
			progressBar.y = this.app.screen.height/2 - h/2;

			this.progressBar = progressBar;
			this.lastProgress = loadingProgress;
		}

		// Redraw progress only if changed
		if( loadingProgress != this.lastProgress && loadingProgress <= 100 ) {
			let progress = this.progressBar.getChildByName('Progress');
			let w = this.progressBar.width * loadingProgress/100;
			let h = this.progressBar.height;
			let r = 10;
			let progShape = new PIXI.RoundedRectangle(0, 0,  w, h, r);

			progress.clear();
			progress.beginFill(Colors.green);
			progress.drawShape(progShape);
			progress.endFill();
			progress.visible = true;

			this.lastProgress = loadingProgress;
		}

	}

}