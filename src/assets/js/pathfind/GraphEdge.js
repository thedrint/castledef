
/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class GraphEdge {

	constructor (start, end, cost = 1.0) {
		this.from = start;
		this.to = end;
		this.cost = cost;
	}
	
	clone() {
		return new GraphEdge(this.from, this.to, this.cost);
	}

}