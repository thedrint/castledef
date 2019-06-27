
export default class Command {

	static get STATE () {
		return {
			CREATE  : 'CREATE',
			EXECUTE : 'EXECUTE',
			FINISH  : 'FINISH',
			FAIL    : 'FAIL',
		};
	}
	constructor (receiver, name, ...params) {
		this.rec    = receiver;// Who executes command, receiver, recipient
		this.name   = name;// Command name
		this.params = params;// array of params
		this.state = undefined;// current state of command
		this.started();
	}

	/**
	 * Flow of executing command
	 * @return {Any} Result of executed command or false
	 */
	execute () {
		this.executed();
		// Make some pre-actions
		if( !this.pre() ) {
			this.failed();
			return false;
		}
		// Run some code that return result
		return this.run();
	}

	/**
	 * Main action of command
	 * All inherits must implement this method
	 * @return {Any} Any result of command
	 */
	run () {
		this.ended();// or failed() or still executed() or pended()
		return true;
	}

	/**
	 * Pre-run hook
	 * @return {bool} If returns false - main execute will be aborted
	 */
	pre () {
		// console.log(`${this.rec.name} prepares command "${this.name}" with next params:`, ...this.params);
		return true;
	}

	// Aliases for set different states
	started  () { this.state = Command.STATE.CREATE; }
	executed () { this.state = Command.STATE.EXECUTE; }
	ended    () { this.state = Command.STATE.FINISH; }
	failed   () { this.state = Command.STATE.FAIL; }
	// Aliases for get different states
	isStarted  () { return this.state == Command.STATE.CREATE; }
	isExecuted () { return this.state == Command.STATE.EXECUTE; }
	isEnded    () { return this.state == Command.STATE.FINISH; }
	isFailed   () { return this.state == Command.STATE.FAIL; }
}
