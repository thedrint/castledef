import Utils from './../Utils';
import IndexedPriorityQueue from './IndexedPriorityQueue';

/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * Code is ported to es6 and modified when needed
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class AstarAlgorithm {
	// public var graph:Graph;
	// public var SPT:Array<GraphEdge>;
	// public var G_Cost:Array<Float>;	//This array will store the G cost of each node
	// public var F_Cost:Array<Float>;	//This array will store the F cost of each node
	// public var SF:Array<GraphEdge>;
	// public var source:Int;
	// public var target:Int;

	constructor (graph,source,target) {
		this.graph = graph;
		this.source = source;
		this.target = target;
		
		this.SPT= [];//new Array<GraphEdge>();
		this.G_Cost = [];//new Array<Float>();
		this.F_Cost = [];//new Array<Float>();
		this.SF = [];//new Array<GraphEdge>();
		
		for( let i of Utils.range(graph.nodes.length) ) {
			this.G_Cost[i] = 0;
			this.F_Cost[i] = 0;
		}
		
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
			// console.log('edges', edges);
			// console.log('nodes', this.graph.nodes);
			for( let edge of edges ) {
				// console.log('edge', edge);
				// let Hcost = Vector.Subtract(this.graph.nodes[edge.to].pos, this.graph.nodes[this.target].pos).length;
				// let Hcost = this.graph.nodes[edge.to].pos.distanceTo(this.graph.nodes[this.target].pos);
				// console.log('node edge.to', this.graph.nodes[edge.to], 'node target', this.graph.nodes[this.target]);
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
