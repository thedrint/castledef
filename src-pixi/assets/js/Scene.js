
import * as PIXI from 'pixi.js';
import Utils from './Utils';

export default class Scene extends PIXI.Container {

	constructor (name, options = {}) {
		super();
		this.app = undefined;
		this.name = name;

		this.utils = new Utils();
	}

	preload () {}

	create () {}

	update () {
		console.log('Updating...');
	}

	drawChild (child, x = 0, y = 0) {
		this.addChild(child);
		child.scene = this;
		child.setTransform(x, y);
	}

	static createEllipse (x, y, width, height, color) {
		let graphics = new PIXI.Graphics();
		graphics.beginFill(color);
		graphics.drawEllipse(x, y, width, height);
		graphics.endFill();
		return graphics;
	}

	static createShape (shape, color) {
		let graphics = new PIXI.Graphics();
		graphics.beginFill(color);
		graphics.drawShape(shape);
		graphics.endFill();
		return graphics;
	}

}