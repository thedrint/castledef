
import Utils from './Utils';
import { UNIT } from './Constants';
import { Defaults } from './Settings';

import Division from './Division';
import Unit from './Unit';
import Hero from './Hero';

export default class Party {
	
	constructor (settings = Defaults.party, leader, units = new Set() ) {
		let partySettings = Utils.cleanOptionsObject(settings, Defaults.party);
		Object.assign(this, partySettings);

		let divs = {};
		for( let i in UNIT.SPECIALIZATION ) {
			let spec = UNIT.SPECIALIZATION[i];
			divs[spec] = new Division(spec);
		}
		this.divisions = divs;

		this.units = new Set();

		this.leader = leader;
		this.hireUnit(leader, UNIT.SPECIALIZATION.HQ);

		if( units.size ) {
			for( let unit of units ) {
				this.hireUnit(unit);
			}			
		}
	}

	isPlayerParty () {
		return ( this.leader instanceof Hero );
	}

	getPartySize () {
		return this.units.size;
	}

	hireUnit (unit, spec = undefined) {
		// Precheck for object type
		if( !(unit instanceof Unit) ) {
			return false;
		}
		//TODO: add heroes at once, troops increments
		let canHired = true;

		//After pass all checks, we can hire unit to party
		if( canHired ) {
			this.units.add(unit);
			// Add link to this party to unit's property
			unit.party = this;
			// by default move unit to its native division
			this.setUnitDivision(unit)
			//TODO: callbacks
			return true;
		}
		else {
			//TODO: callbacks
			return false;
		}
		
	}

	disbandUnit (unit) {
		//TODO: cannot disband heroes, troops decrements
		if( !(unit instanceof Hero) ) {
			this.units.delete(unit);
			// Remove link to this party from unit's property
			unit.party = undefined;
			//TODO: change leader of party if need
			// Remove unit from division
			this.divisions[unit.division].removeUnit(unit);
			return true;
		}
		else {
			return false;
		}
	}

	setUnitDivision (unit, type = undefined) {
		// Precheck for object type
		if( !(unit instanceof Unit) ) {
			return false;
		}

		if( !type ) {
			type = unit.spec;
		}


		for( let div in this.divisions ) {
			let division = this.divisions[div];
			if( division.type == type ) {
				division.addUnit(unit);
			}
		}
	}
}