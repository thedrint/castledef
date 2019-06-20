
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import { Game as GameSettings, Defaults } from './../Settings';
import Utils from './../Utils';

import Container from './../base/Container';

import Scene from './../Scene';

export default class Crate extends Container {

	constructor (settings = {
		name  : Defaults.crate.name, 
		attrs : Defaults.crate.attrs, 
		model : Defaults.crate.model
	}) {

		super();

		let { 
			name = Defaults.crate.name, 
			attrs = Defaults.crate.attrs, 
			model = Defaults.crate.model 
		} = settings;
		this.name = name;

		this.attrs = Utils.cleanOptionsObject(attrs, Defaults.crate.attrs);

		this.initModel(model);
	}

	initModel (model = Defaults.crate.model) {
		let params = Utils.cleanOptionsObject(model, Defaults.crate.model);

		let crateWidth = params.size * GameSettings.unit.size;
		let crateHeight = crateWidth;

		let models = [];
		let crate;
		if( params.texture && params.texture.baseTexture ) {

			let res = params.texture.baseTexture.resource;
			let svgTexture = PIXI.BaseTexture.from(res);
			svgTexture.setSize(crateWidth, crateHeight);
			let crateTexture = new PIXI.Texture(svgTexture);
			crate = PIXI.Sprite.from(crateTexture);
			// crate.anchor.set(0.5);
			crate.x -= crateWidth/2;
			crate.y -= crateHeight/2;
			// crate.pivot.x = 0.5 * crate.width;
			// crate.pivot.y = 0.5 * crate.height;
			// crate.angle = 45;
			crate.name = `Crate`;
			models.push(crate);
		}
		else {	
			crate = Scene.createShape(new PIXI.Rectangle(0, 0, crateWidth, crateHeight), params.color);
			// crate.pivot.x = 0.5 * crate.width;
			// crate.pivot.y = 0.5 * crate.height;
			crate.name = `Crate`;
			models.push(crate);
		}


		this.addChild(...models);
		this.pivot.x += 0;
		this.pivot.y += 0;

		this.shape = new IntersectHelper.Rectangle(this);
	}

	getModel () {
		return this.getChildByName('Crate');
	}
}
