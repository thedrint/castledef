
import * as PIXI from 'pixi.js';
import Intersects from 'yy-intersects';

import { GameSettings, FPS, Defaults } from './Settings';
import Utils from './Utils';
import Scene from './Scene';

export default class Shield extends PIXI.Graphics {

	constructor (settings = {
		name  : Defaults.shield.name, 
		attrs : Defaults.shield.attrs, 
		model : Defaults.shield.model
	}, x = 0, y = 0) {

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
		let plateHeight = 3;//TODO: Replace magic number with setting or formula

		let models = [];
		let plate = Scene.createShape(new PIXI.Rectangle(0, 0, plateWidth, plateHeight), params.color);
		plate.pivot.x = 0.5 * plate.width;
		plate.pivot.y = 0.5 * plate.height;
		plate.name = `Plate`;
		// plate.shape = new Intersects.Rectangle(plate);
		models.push(plate);
		// let umbo = Scene.CreateShape(0, 0, 0, 0, shieldLength, 0, params.color);
		// umbo.setOrigin(0.5);
		// umbo.name = `Umbo`;
		// umbo.shape = new Intersects.Shape(umbo);
		// models.push(umbo);

		this.addChild(...models);

		this.shape = new Intersects.Rectangle(this, {center:this.getGlobalPosition(), rotation:this});
	}

	getPlate () {
		return this.getChildByName('Plate');
	}
	getWidth () {
		return this.getPlate().width;
	}
}