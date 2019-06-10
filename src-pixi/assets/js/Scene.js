
import * as PIXI from 'pixi.js';

export default class Scene extends PIXI.Container {

	constructor (name, options = {}) {
		super();
		this.app = undefined;
		this.name = name;
	}

	preload () {}

	create () {}

	update () {
		console.log('Updating...');
	}
}