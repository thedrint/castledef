
import * as PIXI from 'pixi.js';

import Colors from './../Colors';
import { ApplicationSettings, FPS, GameSettings } from './../Settings';

import Scene from './../Scene';

import Utils from './../Utils';
// load sprites
// import KnightImage from './../../img/knight.png';
import SwordImage from './../../img/Sword.svg';
import ShortSwordImage from './../../img/shortsword.jpg';

export default class LoadScene extends Scene {

	constructor (name, options = {}) {
		super(name, options);
	}

	init () {
		this.resourceLoadingProgress = 0;
	}

	preload () {
		console.log('SceneLoad preload()');
		let loader = PIXI.Loader.shared;
		const textures = {};

		loader.add('Sword', SwordImage);
		loader.add('ShortSword', ShortSwordImage);

		loader.load((loader, resources) => {
			textures.Sword = resources.Sword.texture;
			Object.assign(this.app.textures, textures);
			// console.log(this.app.textures);
		});

		loader.onProgress.add((loader) => {
			this.resourceLoadingProgress = loader.progress;
		});
	}

	create () {
		console.log('SceneLoad create()')
	}

	update () {
		console.log(`LoadScene update(). Progress loading resources is ${this.resourceLoadingProgress}`);

		if( this.resourceLoadingProgress == 100 ) {
			this.app.stage.switchTo("MainScene");
		}
	}

}