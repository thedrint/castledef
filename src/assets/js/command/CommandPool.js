import Command from './Command';

export default class CommandPool extends Array {

	constructor (...params) {
		super(...params);
		this.current = undefined;
	}

	// Add new command to pool
	add (com) {
		super.push(com);
	}

	get (n) {
		return this[n];
	}

	getFirst () {
		return this[0];
	}

	// Deletes element with index n
	delete (n) {
		super.splice(n,1);
	}

	clear () {
		super.length = 0;
	}

	execute (com) {
		let result = com.execute();
		// console.log(`${com.rec.name} did "${com.name}" with state ${com.state} and had next result:`, result);
		return result;
	}

	executeCurrent () {
		let com = this.getFirst();
		let result = this.execute(com);
		if( com.isEnded() || com.isFailed() ) {
			this.delete(0);
			// console.log(`${com.name} was deleted from pool`);
		}
		return result;
	}

	isExecuting (n) {
		return ( this[n].isExecuted() );
	}

}
