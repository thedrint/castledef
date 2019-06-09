
import Phaser from 'phaser';
import { gameInternalSettings } from './GameSettings';

export default class Shield extends Phaser.GameObjects.Container {

	constructor (settings = {name, defend, model}, scene, x = 0, y = 0) {
		super(scene, x, y);
		scene.add.existing(this);
		this.initSettings(settings);
	}

	initSettings(settings = {name, defend, model}) {
		let {
			name     = `Shield`,
			defend   = 1,
		} = settings;
		let unitSettings = {
			name     ,
			defend   ,
		};
		Object.assign(this, unitSettings);

		this.initModel(settings.model);
	}

	initModel (modelParams = {size:1, color}) {
		let {
			size  = 1,
			color = 0x654321,
		} = modelParams;
		let params = {
			size  , 
			color ,
		};

		let plateLength = params.size * gameInternalSettings.unit.size;

		this.setSize(plateLength, 3);


		let plate = this.scene.add.line(0, 0, 0, 0, plateLength, 0, params.color);
		plate.setLineWidth(3);
		plate.setOrigin(0.5);
		plate.setName('Plate');
		this.add(plate);

		// let umbo = this.scene.add.arc(0, 0, 0, 0, shieldLength, 0, params.color);
		// umbo.setOrigin(0.5);
		// umbo.setName('Umbo');
		// this.add(umbo);

		// console.log(`Weapon bounds:`, this.getBounds());
	}

	getPlate () {
		return this.getByName('Plate');
	}


	getLength () {
		return this.getPlate().width;
	}
}