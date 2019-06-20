
import * as PIXI from 'pixi.js';

import { WebFont as WebFontConfig } from './../Settings';

import Colors from './../Colors';

import Scene from './../Scene';

import Utils from './../Utils';

// load sprites
import { Textures as ImageTextures } from './../../img/Textures';

import 'reset-css';

// Local loading of font - have a bug in rendering, use Webfont instead
// import './../../fonts/PressStart2P.css';

export default class LoadScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
	}

	preload () {
		this.resourceLoadingProgress = 0;
		console.log('SceneLoad preload()');
		this.preloadWebfonts();
		// this.preloadResources();
	}

	preloadWebfonts () {
		let fonts = this.app.fonts;
		// Loading fonts first
		let fontsLoading = Object.assign(WebFontConfig, {
			active: () => {
				// Then loading other resources
				this.fontsLoaded = true;

				this.preloadResources();
			}
		});
		fonts.load(fontsLoading);

	}

	preloadResources () {
		let loader = PIXI.Loader.shared;
		const textures = {};

		for( let i in ImageTextures ) {
			loader.add(i, ImageTextures[i]);
		}

		loader.load((loader, resources) => {
			for( let i in resources ) {
				let key = resources[i].name;
				textures[key] = resources[i].texture;
			}
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

			let text = new PIXI.Text(`${loadingProgress}%`, {
				fontFamily : 'Press Start 2P', fontWeight: 400, fontSize: h/2, lineHeight: h/2, 
				fill : Colors.black, 
				align : `center`,
			});
			text.name = 'Text';
			text.anchor.set(0.5);

			progressBar.addChild(background, progress, text);
			this.addChild(progressBar);

			progress.visible = false;

			progressBar.x = (this.app.screen.width - w) / 2;
			progressBar.y = this.app.screen.height/2 - h/2;
			text.y = h/2;
			text.x = w/2;

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

			// Redraw only for tens
			if( loadingProgress%10 == 0 ) {
				let text = this.progressBar.getChildByName('Text');
				text.text = `${loadingProgress}%`;
				text.visible = true;
			}

			this.lastProgress = loadingProgress;
		}

	}

}