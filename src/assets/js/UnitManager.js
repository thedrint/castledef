
import ItemManager from './base/ItemManager';
/**
 * Logical structure for manage units in scene
 */
export default class UnitManager extends ItemManager {

	constructor (scene) {
		super();
		this.scene = scene;
	}

	add (unit) {
		super.add(unit);
		this.scene.registry.add(unit);
		return this;
	}

	delete (unit) {
		this.scene.registry.delete(unit);
		return super.delete(unit);
	}

	clear () {
		for( let unit of this )
			this.scene.registry.delete(unit);
		
		return super.clear();
	}

}