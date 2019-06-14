
import * as PIXI from 'pixi.js';
import * as TWEEN from 'es6-tween';
import IntersectHelper from './IntersectHelper';

import { GameSettings, FPS, Defaults } from './Settings';
import Utils from './Utils';
import Scene from './Scene';

export default class Weapon extends PIXI.Graphics {

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
	}

	initModel (model = Defaults.weapon.model) {
		let params = Utils.cleanOptionsObject(model, Defaults.weapon.model);

		let bladeLength = params.size * GameSettings.unit.size;
		let bladeWidth = 3;//TODO: Replace magic number with setting or formula

		let guardWidth = bladeLength * 0.1;
		let guardDepth = 1;

		let models = [];
		//TODO: Ha-ha, rectangled blade like from orcs
		let blade = Scene.createShape(new PIXI.Rectangle(0, 0, bladeLength, bladeWidth), params.color);
		blade.name = `Blade`;
		// blade.shape = new Intersects.Rectangle(blade);
		models.push(blade);
		// let guard = Scene.createShape(new PIXI.Rectangle(0, 0, guardWidth, guardDepth), params.color);
		// guard.name = `Guard`;
		// guard.shape = new Intersects.Rectangle(guard);
		// model.push(guard);

		this.addChild(...models);

		this.shape = new IntersectHelper.Rectangle(this);
	}

	getBlade () {
		return this.getChildByName('Blade');
	}
	getLength () {
		return this.getBlade().width;
	}

	pierce () {
		let pierceLength = this.width;

		const tween = new TWEEN.Tween(this)
			.to({x:pierceLength}, 200)
			.repeat(Infinity)
			.easing(TWEEN.Easing.Linear.None)
			.yoyo(true)
			// .on('update', () => {
			// 	console.log(tween)
			// })
			.start()
		;
	}
}