// import luxe.Vector;
import Utils from './../Utils';
import Graph from './Graph';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import AstarAlgorithm from './AstarAlgorithm';
import DijkstraAlgorithm from './DijkstraAlgorithm';

export default class PolygonMap {

  constructor (w, h) {
		this.mainwalkgraph = new Graph();
		this.calculatedpath = []//new Array<Int>();

		this.vertices_concave = [];//new Array<Vector>();
		this.polygons = [];//new Array<Polygon>();
		this.walkgraph = undefined;
		this.targetx = undefined;
		this.targety = undefined;
		this.startNodeIndex = 0;
		this.endNodeIndex = 0;
  }

	Distance(v1, v2) {
		return Utils.distanceBetween(v1, v2);
	}
	
	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	InLineOfSight(start, end) {
		let epsilon = 0.5;

		// Not in LOS if any of the ends is outside the polygon
		if( !this.polygons[0].pointInside(start) || !this.polygons[0].pointInside(end) ) {
			return false;
		}

		// In LOS if it's the same start and end location
		if( this.Distance(start, end) < epsilon ) {
			return true;
		}
	
		// Not in LOS if any edge is intersected by the start-end line segment
		let inSight = true;
		for( let polygon of this.polygons ) {
			for( let i of Utils.range(polygon.vertices.length) ) {
				let v1 = polygon.vertices[i];
				let v2 = polygon.vertices[(i + 1) % polygon.vertices.length];
				if (this.LineSegmentsCross(start, end, v1, v2)) {
					//In some cases a 'snapped' endpoint is just a little over the line due to rounding errors. So a 0.5 margin is used to tackle those cases.
					if (polygon.distanceToSegment(start.x, start.y, v1.x, v1.y, v2.x, v2.y ) > epsilon && polygon.distanceToSegment(end.x, end.y, v1.x, v1.y, v2.x, v2.y ) > epsilon) {
						return false;
					}
				}
			}
		}


		// Finally the middle point in the segment determines if in LOS or not
		// WHAT?
		let v = {x:(start.x + end.x), y: (start.y + end.y)}//Vector.Add(start, end);
		let v2 = {x:v.x / 2, y:v.y / 2};
		let inside = this.polygons[0].pointInside(v2);
		for( let polygon of this.polygons ) {
			if( polygon == this.polygons[0] ) continue;// Already checked
			
			if( polygon.pointInside(v2, false) ) {
				inside = false;
			}
		}
		// console.log('InLineofSight', start, end, v2, inside);
		return inside;
	}

	

	createGraph () {
		let startCalc = performance.now();

		this.mainwalkgraph = new Graph();
		let first = true;
		this.vertices_concave = []//new Array<Vector>();
		for( let polygon of this.polygons ) {
			if (polygon != null && polygon.vertices != null && polygon.vertices.length > 2) {
				for( let i of Utils.range(polygon.vertices.length) ) {
					//check using boolean 'first', because the first polygon is the walkable area
					//and all other polygons are blocking polygons inside the walkabl area and for
					//those polygons we need the non-concave vertices
					if( this.IsVertexConcave(polygon.vertices, i) == first ) {
						let index = this.vertices_concave.length;
						this.vertices_concave.push(polygon.vertices[i]);
						this.mainwalkgraph.addNode(new GraphNode({x:polygon.vertices[i].x, y:polygon.vertices[i].y}));
					}
				}
			}
			first = false;
		}
		for( let c1_index of Utils.range(this.vertices_concave.length) ) {
			for( let c2_index of Utils.range(this.vertices_concave.length) ) {
				var c1 = this.vertices_concave[c1_index];
				var c2 = this.vertices_concave[c2_index];
				if( this.InLineOfSight(c1, c2) ) {
					this.mainwalkgraph.addEdge(new GraphEdge(c1_index, c2_index, this.Distance(c1, c2)));
				}
			}
		}
		console.log(`Graph created in ${performance.now() - startCalc}ms`);
	}
	
	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	LineSegmentsCross (a, b, c, d){
		let intersect = Utils.linesIntersect(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
		// console.log('intersect', intersect);
		return intersect != null;
	}

	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	IsVertexConcave (vertices, vertex) {
		let current = vertices[vertex];
		let next = vertices[(vertex + 1) % vertices.length];
		let previous = vertices[vertex == 0 ? vertices.length - 1 : vertex - 1];

		let left = {x:current.x - previous.x, y:current.y - previous.y};
		let right = {x:next.x - current.x, y:next.y - current.y};

		let cross = (left.x * right.y) - (left.y * right.x);

		return cross < 0;
	}
	
	calculatePath (from, to) {
		let startCalc = performance.now();
		// console.log(from, to);
		//Clone the graph, so you can safely add new nodes without altering the original graph
		this.walkgraph = this.mainwalkgraph.clone();
		const mindistanceFrom = 100000;
		const mindistanceTo = 100000;

		//create new node on start position
		this.startNodeIndex = this.walkgraph.nodes.length;
		if( !this.polygons[0].pointInside(from) ) {
			from = this.polygons[0].getClosestPointOnEdge(from);
		}
		if( !this.polygons[0].pointInside(to) ) {
			to = this.polygons[0].getClosestPointOnEdge(to);
		}



		//Are there more polygons? Then check if endpoint is inside one of them and find closest point on edge
		if( this.polygons.length > 1 ) {
			for( let i of Utils.range(this.polygons.length-1, 1) ) {
				if( this.polygons[i].pointInside(to) ) {
					to = this.polygons[i].getClosestPointOnEdge(to);
					break;
				}
			}
		}
		
		this.targetx = to.x;
		this.targety = to.y;


		let startNode = new GraphNode({x:from.x, y:from.y});
		let startNodeVector = {x:startNode.pos.x, y:startNode.pos.y};
		this.walkgraph.addNode(startNode);

		for( let c_index of Utils.range(this.vertices_concave.length) ) {
			let c = this.vertices_concave[c_index];
			if( this.InLineOfSight(startNodeVector, c) ) {
				this.walkgraph.addEdge(new GraphEdge(this.startNodeIndex, c_index, this.Distance(startNodeVector, c)));
			}
		}


		//create new node on end position
		this.endNodeIndex = this.walkgraph.nodes.length;

		let endNode = new GraphNode({x:to.x, y:to.y});
		let endNodeVector = {x:endNode.pos.x, y:endNode.pos.y};
		this.walkgraph.addNode(endNode);

		for( let c_index of Utils.range(this.vertices_concave.length) ) {
			let c = this.vertices_concave[c_index];
			if( this.InLineOfSight(endNodeVector, c) ) {
				this.walkgraph.addEdge(new GraphEdge(c_index, this.endNodeIndex, this.Distance(endNodeVector, c)));
			}
		}
		if( this.InLineOfSight(startNodeVector, endNodeVector) ) {
			this.walkgraph.addEdge(new GraphEdge(this.startNodeIndex, this.endNodeIndex, this.Distance(startNodeVector, endNodeVector)));
		}
		
		//you can switch between A* and dijkstra algorithms by commenting one and uncommenting the other
		
		// let astar = new AstarAlgorithm(this.walkgraph, this.startNodeIndex, this.endNodeIndex);
		// this.calculatedpath = astar.getPath();

		let dijkstra = new DijkstraAlgorithm(this.walkgraph, this.startNodeIndex, this.endNodeIndex);
		this.calculatedpath = dijkstra.getPath();
		
		console.log(`Path calculated in ${performance.now() - startCalc}ms`);
		return this.calculatedpath;
	}

}
