
import * as PIXI from 'pixi.js';
import IntersectHelper from './../IntersectHelper';

import { Game as GameSettings, Defaults } from './../Settings';
import Utils from './../Utils';

import Container from './../base/Container';

import Scene from './../Scene';

export default class Shield extends Container {

	constructor (settings = {
		name  : Defaults.shield.name, 
		attrs : Defaults.shield.attrs, 
		model : Defaults.shield.model
	}) {

		super();

		let { 
			name = Defaults.shield.name, 
			attrs = Defaults.shield.attrs, 
			model = Defaults.shield.model 
		} = settings;
		this.name = name;

		this.attrs = Utils.cleanOptionsObject(attrs, Defaults.shield.attrs);

		this.initModel(model);
	}

	initModel (model = Defaults.shield.model) {
		let params = Utils.cleanOptionsObject(model, Defaults.shield.model);

		let plateWidth = params.size * GameSettings.unit.size;
		let plateHeight = 7;//TODO: Replace magic number with setting or formula

		let models = [];
		let plate;
		if( params.texture && params.texture.baseTexture ) {

			let res = params.texture.baseTexture.resource;
			let svgTexture = PIXI.BaseTexture.from(res);
			svgTexture.setSize(plateWidth, res.height * plateWidth/res.width * 0.4);
			let plateTexture = new PIXI.Texture(svgTexture);
			plate = PIXI.Sprite.from(plateTexture);
			plate.anchor.set(0.5);
			plate.pivot.x = 0.5 * plate.width;
			plate.pivot.y = 0.5 * plate.height;
			plate.rotation = Math.PI;
			// plate.rotation = 0;
			plate.name = `Plate`;
			models.push(plate);
		}
		else {	
			plate = Scene.createShape(new PIXI.Rectangle(0, 0, plateWidth, plateHeight), params.color);
			// plate.pivot.x = 0.5 * plate.width;
			// plate.pivot.y = 0.5 * plate.height;
			plate.name = `Plate`;
			models.push(plate);
			// let umbo = Scene.CreateShape(0, 0, 0, 0, shieldLength, 0, params.color);
			// umbo.setOrigin(0.5);
			// umbo.name = `Umbo`;
			// models.push(umbo);
		}


		this.addChild(...models);
		this.pivot.x += 0.5 * plate.width;
		this.pivot.y += 0.5 * plate.height;

		this.shape = new IntersectHelper.Rectangle(this);
	}

	getPlate () {
		return this.getChildByName('Plate');
	}
	getWidth () {
		return this.getPlate().width;
	}
}
