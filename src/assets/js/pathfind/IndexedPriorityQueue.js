
import Utils from './../Utils';
/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class IndexedPriorityQueue {

	constructor (keys = []) {
		this.keys = keys;
		this.data = [];
	}
	
	insert (index) {
		this.data[this.data.length] = index;
		this.reorderUp();
	}
	
	pop ()
	{
		let r = this.data[0];
		this.data[0] = this.data[this.data.length-1];
		this.data.pop();
		this.reorderDown();
		return r;
	}
	
	reorderUp () {
		let a = this.data.length-1;
		while( a > 0 ) {
			if( this.keys[this.data[a]] < this.keys[this.data[a-1]] ) {
				let tmp = this.data[a];
				this.data[a] = this.data[a-1];
				this.data[a-1] = tmp;
			}
			else {
				return;
			}
			a--;
		}
	}
	
	reorderDown () {
		for( let a of Utils.range(this.data.length) ) {
			if( this.keys[this.data[a]] > this.keys[this.data[a+1]] ) {
				let tmp = this.data[a];
				this.data[a] = this.data[a+1];
				this.data[a+1] = tmp;
			}
			else {
				return;
			}
		}
	}
	
	isEmpty () {
		return (this.data.length == 0);
	}
}
