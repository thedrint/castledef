
import Party from './Party';

/**
 * Logical structure for manage unit's parties
 */
export default class PartyManager {

	constructor (scene) {

		this.scene = scene;
		this.parties = new Map();
	}

	get (name) {
		return this.parties.get(name);
	}

	add (party) {
		let name = party.name;
		if( name == undefined ) {
			return false;
		}
		if( this.parties.has(name) ) {
			return false;
		}

		this.parties.set(name, party);

		return this;
	}

	delete (name) {
		return this.parties.delete(name);
	}

	clear () {
		return this.parties.clear();
	}

	asArray () {
		return [...this.parties.values()];
	}

}