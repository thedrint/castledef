
import * as PIXI from 'pixi.js';
import * as TWEEN from 'es6-tween';
import IntersectHelper from './../IntersectHelper';

import { Game as GameSettings, Defaults } from './../Settings';
import Utils from './../Utils';

import Graphics from './../base/Graphics';

import Scene from './../Scene';

export default class Weapon extends PIXI.Container {

	constructor (settings = {
		name: Defaults.weapon.name, 
		attrs: Defaults.weapon.attrs, 
		model: Defaults.weapon.model
	}) {

		super();

		let { 
			name = Defaults.weapon.name, 
			attrs = Defaults.weapon.attrs, 
			model = Defaults.weapon.model 
		} = settings;
		this.name = name;

		this.attrs = Utils.cleanOptionsObject(settings, Defaults.weapon.attrs);

		this.initModel(model);

		this.piercing = false;
		this.collider = false;
	}

	initModel (model = Defaults.weapon.model) {
		let params = Utils.cleanOptionsObject(model, Defaults.weapon.model);

		let bladeLength = params.size * GameSettings.unit.size;
		let bladeWidth = 3;//TODO: Replace magic number with setting or formula

		let guardWidth = bladeWidth + 3*2;
		let guardDepth = 3;

		let models = [];
		let blade, bladeTexture;
		if( params.texture && params.texture.baseTexture ) {
			// console.log(params.texture);
			let res = params.texture.baseTexture.resource;
			
			let svgTexture = PIXI.BaseTexture.from(res);
			svgTexture.setSize(bladeLength, res.height * bladeLength/res.width);
			let bladeTexture = new PIXI.Texture(svgTexture);
			// bladeTexture.defaultAnchor = new PIXI.Point(0, bladeTexture.height/2);
			blade = PIXI.Sprite.from(bladeTexture);
			blade.name = `Blade`;
			models.push(blade);
		}
		else {// For compability
			blade = Scene.createShape(new PIXI.Rectangle(0, 0, bladeLength, bladeWidth), params.color);
			blade.name = `Blade`;

			let guard = Scene.createShape(new PIXI.Rectangle(bladeLength/4, -guardWidth/2, guardDepth, guardWidth), params.color);
			guard.name = `Guard`;
			models.push(guard);
			models.push(blade);
		}


		this.addChild(...models);

		this.shape = new IntersectHelper.Rectangle(this);
	}

	getBlade () {
		return this.getChildByName('Blade');
	}
	getLength () {
		return this.getBlade().width;
	}

	pierce (target, speed = 300) {
		if( this.piercing )
			return;
		
		let pierceLength = this.width;

		const tween = new TWEEN.Tween(this)
			.to({x:pierceLength}, speed)
			.repeat(1)
			.easing(TWEEN.Easing.Linear.None)
			.yoyo(true)
			// .on('update', () => {
			// 	console.log(tween)
			// })
			.on('complete', () => {
				// console.log('Piercing complete');
				this.piercing = false;
				this.collider = false;
			})
			.start()
		;

		this.piercing = tween;
	}
}
