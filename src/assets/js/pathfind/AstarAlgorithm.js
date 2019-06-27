import Utils from './../Utils';
import IndexedPriorityQueue from './IndexedPriorityQueue';

/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class AstarAlgorithm {

	constructor (graph,source,target) {
		this.graph  = graph;  // Calculated graph
		this.source = source; // Path start node index
		this.target = target; // Path end node index
		
		this.SPT= [];
		this.G_Cost = []; //This array will store the G cost of each node
		this.F_Cost = []; //This array will store the F cost of each node
		this.SF = [];
		
		graph.nodes.forEach( (v,i) => {
			this.G_Cost[i] = 0;
			this.F_Cost[i] = 0;
		});
		
		this.search();
	}
	
	search () {
		let pq = new IndexedPriorityQueue(this.F_Cost);
		pq.insert(this.source);
		while( !pq.isEmpty() )
		{
			let NCN = pq.pop();
			this.SPT[NCN] = this.SF[NCN];
			if( NCN == this.target) {
				return;
			}

			let edges = this.graph.edges[NCN];
			for( let edge of edges ) {
				// let Hcost = Vector.Subtract(this.graph.nodes[edge.to].pos, this.graph.nodes[this.target].pos).length;
				// let Hcost = this.graph.nodes[edge.to].pos.distanceTo(this.graph.nodes[this.target].pos);
				// In this game Hcost is only distance
				let Hcost = Utils.distanceBetween(this.graph.nodes[edge.to].pos, this.graph.nodes[this.target].pos);
				let Gcost = this.G_Cost[NCN] + edge.cost;
				let to = edge.to;
				if( this.SF[edge.to] == null ) {
					this.F_Cost[edge.to] = Gcost + Hcost;
					this.G_Cost[edge.to] = Gcost;
					pq.insert(edge.to);
					this.SF[edge.to] = edge;
				}
				else if( (Gcost < this.G_Cost[edge.to]) && (this.SPT[edge.to] == null) ) {
					this.F_Cost[edge.to] = Gcost + Hcost;
					this.G_Cost[edge.to] = Gcost;
					pq.reorderUp();
					this.SF[edge.to] = edge;
				}
			}
		}
	}
	
	getPath () {
		let path = new Array();
		if( this.target < 0 ) {
			return path;
		}

		let nd = this.target;
		path.push(nd);
		while( (nd != this.source) && (this.SPT[nd] != null) ) {
			nd = this.SPT[nd].from;
			path.push(nd);
		}
		path.reverse();
		return path;
	}
}
