
import Utils from './../Utils';
import IndexedPriorityQueue from './IndexedPriorityQueue';

/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class DijkstraAlgorithm {

	constructor (graph, source, target) {
		this.graph  = graph;
		this.source = source;
		this.target = target;
		
		
		this.SPT= [];//new Array<GraphEdge>();
		this.cost2Node = [];//new Array<Float>();
		this.SF = []//new Array<GraphEdge>();
		
		for( let i of Utils.range(this.graph.nodes.length) ) {
			this.cost2Node[i] = 0;
		}
		
		this.search();
	}

	search () {
		let pq = new IndexedPriorityQueue(this.cost2Node);
		pq.insert(this.source);
		while( !pq.isEmpty() ) {
			let NCN = pq.pop();
			this.SPT[NCN] = this.SF[NCN];
			if( NCN == this.target ) return;

			let edges = this.graph.edges[NCN];
			
			for( let edge of edges ) {
				let nCost = this.cost2Node[NCN] + edge.cost;
				if( this.SF[edge.to] == null ) {
					this.cost2Node[edge.to] = nCost;
					pq.insert(edge.to);
					this.SF[edge.to] = edge;
				}  
				else if( (nCost < this.cost2Node[edge.to]) && (this.SPT[edge.to] == null) ) {
					this.cost2Node[edge.to] = nCost;
					pq.reorderUp();
					this.SF[edge.to] = edge;
				}
			}
		}
	}
	
	getPath () {
		let path = [];//new Array<Int>();
		if( (this.target < 0) || (this.SPT[this.target] == null) ) return path;
		let nd = this.target;
		path.push(nd);
		while( (nd != this.source) && (this.SPT[nd] != null)) {
			nd = this.SPT[nd].from;
			path.push(nd);
		}
		path.reverse();
		return path;
	}

}
