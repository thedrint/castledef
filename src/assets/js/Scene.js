
import * as PIXI from 'pixi.js';
import Utils from './Utils';

import Container from './base/Container';

export default class Scene extends Container {

	constructor (name, options = {}) {
		super();
		this.app = undefined;
		this.name = name;
	}

	init () {
		console.log('Init Scene...');
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