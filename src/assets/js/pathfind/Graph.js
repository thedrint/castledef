
import GraphEdge from './GraphEdge';
import Utils from './../Utils';

/*
 * All pathfinding classes are based on the AactionScript 3 implementation by Eduardo Gonzalez
 * http://code.tutsplus.com/tutorials/artificial-intelligence-series-part-1-path-finding--active-4439
 */
export default class Graph {

	constructor () {
		this.nodes = [];// array of GraphNodes
		this.edges = [];// array of array GraphEdges
	}
	
	clone () {
		let g = new Graph();
		for( let n of Utils.range(this.nodes.length) ) {
			g.nodes[n] = this.nodes[n].clone();
		}

		for ( let i of Utils.range(this.edges.length) ) {
			g.edges[i] = [];// array of GraphEdge
			for( let e of this.edges[i] ) {
				g.edges[i].push(e.clone());
			}
		}

		return g;
	}

	getEdge (from, to) {
		let from_Edges = this.edges[from];
		for( let a of from_Edges )
		{
			if( a.to == to )
			{
				return a;
			}
		}

		return null;
	}

	addNode (node) {
		this.nodes.push(node);
		this.edges.push(new Array());
		return 0;
	}
	
	addEdge (edge) {
		if( this.getEdge(edge.from, edge.to) == null ) {
			this.edges[edge.from].push(edge);
		}
		if( this.getEdge(edge.to, edge.from) == null ) {
			this.edges[edge.to].push(new GraphEdge(edge.to, edge.from, edge.cost));
		}
	}

}
