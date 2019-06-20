
export default class Division {
	constructor (type) {
		this.type = type;
		this.units = new Set();
	}
	
	addUnit (unit) {
		this.units.add(unit);
		// add link to division into unit's property
		unit.division = this.type;
	}

	removeUnit (unit) {
		this.units.delete(unit);
		// remove link to division from unit's property
		unit.division = undefined;
	}

	getSize () {
		return this.units.size;
	}

	getType () {
		return this.type;
	}

	getBaseBattlePotential () {
		let pt = 0;
		for( let unit of this.units ) {
			//TODO: change formula to reality
			pt += unit.attrs.lvl;
		}

		return pt;
	}
}