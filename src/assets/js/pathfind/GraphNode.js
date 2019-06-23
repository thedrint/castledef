
/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class GraphNode {
	
	constructor (pos)
	{
		this.pos = pos;
	}
	
	clone() {
		let r = new GraphNode({x:this.pos.x, y:this.pos.y});
		return r;
	}
}