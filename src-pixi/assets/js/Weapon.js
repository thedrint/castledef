
import Phaser from 'phaser';
import { gameInternalSettings } from './GameSettings';

export default class Weapon extends Phaser.GameObjects.Container {

	constructor (settings = {name: 'Weapon', model}, scene, x = 0, y = 0) {
		super(scene, x, y);
		scene.add.existing(this);
		this.initSettings(settings);
	}

	initSettings(settings = {name: 'Weapon', model}) {
		let {
			name     = `Weapon`,
		} = settings;
		let unitSettings = {
			name     ,
		};
		Object.assign(this, unitSettings);

		this.initModel(settings.model);
	}

	initModel (modelParams = {size:1, color}) {
		let {
			size  = 1,
			color = 0x999999,
		} = modelParams;
		let params = {
			size  , 
			color ,
		};

		let bladeLength = params.size * gameInternalSettings.unit.size;

		this.setSize(bladeLength, 3);


		let blade = this.scene.add.line(0, 0, 0, 0, bladeLength, 0, params.color);
		blade.setOrigin(0);
		blade.setName('Blade');
		this.add(blade);

		// console.log(`Weapon bounds:`, this.getBounds());
	}

	getBlade () {
		return this.getByName('Blade');
	}
	getLength () {
		return this.getBlade().width;
	}

	updateBoundsHelper (gameObject) {
		if( gameObject.boundsHelper ) {
			gameObject.boundsHelper.destroy();
		}
		gameObject.boundsHelper = gameObject.scene.add.graphics();

		let d = gameObject.getWorldTransformMatrix().decomposeMatrix();
		let bounds = gameObject.getBounds();
		// console.log(bounds.width, bounds.height);

		gameObject.boundsHelper.clear();
		gameObject.boundsHelper.lineStyle(1, 0xff0000, 1);			
		gameObject.boundsHelper.strokeRect(d.translateX-bounds.width/2, d.translateY-bounds.height/2, bounds.width, bounds.height);
		// this.boundsHelper.setRotation(d.rotation);
	}

}