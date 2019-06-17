
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
		this.resourceLoadingProgress = 0;
	}

	preload () {
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