
import * as PIXI from 'pixi.js';

export default class SceneManager extends PIXI.Container {

	constructor (app) {
		super();

		this.app = app;
		this.scenes = new Set();
		this.current = undefined;
	}

	add (scene) {
		let name = scene.name;
		if( name == undefined )
			return false;
		if( this.scenes.has(name) )
			return false;

		this.scenes.add(name);
		this.addChild(scene);
		scene.app = this.app;

		if( this.scenes.size == 1 )
			this.current = name;

		return this;
	}

	delete (name) {
		if( !this.scenes.has(name) )
			return false;

		let scene = this.getChildByName(name);
		if( this.removeChild(scene) )
			return this.scenes.delete(name);
		else
			return false;
	}

	clear () {
		if( this.removeChildren() )
			return this.scenes.clear();
		else
			return false;
	}

	getCurrentScene () {
		return this.getChildByName(this.current);
	}

	showScene (name) {
		let scene = this.getChildByName(name);
		scene.visible = true;
		return scene;
	}
	hideScene (name) {
		let scene = this.getChildByName(name);
		scene.visible = false;
		return scene;
	}

	switchTo (name) {
		this.scenes.forEach( sceneName => {
			if( name != sceneName ) {
				this.hideScene(sceneName);
			}
		});

		this.current = name;
		return this.showScene(name);
	}
}