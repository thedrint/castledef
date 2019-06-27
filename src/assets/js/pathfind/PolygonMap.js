// import luxe.Vector;
import Utils from './../Utils';
import Polygon from './Polygon';
import Graph from './Graph';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import AstarAlgorithm from './AstarAlgorithm';
import DijkstraAlgorithm from './DijkstraAlgorithm';

export default class PolygonMap {

  constructor (w = 0, h = 0) {
		this.mainwalkgraph = new Graph();
		this.calculatedpath = []//new Array<Int>();

		this.vertices_concave = [];//new Array<Vector>();
		this.polygons = [];//new Array<Polygon>();
		this.walkgraph = undefined;
		this.targetx = undefined;
		this.targety = undefined;
		this.startNodeIndex = 0;
		this.endNodeIndex = 0;

		if( w && h ) {
			this.setMainPolygon(w,h);
		}
  }

  setMainPolygon (w,h) {
  	this.polygons[0] = new Polygon( ...Utils.atoc([0,0, w,0, w,h, 0,h]) );
  	return this;
  }

	Distance (v1, v2) {
		return Utils.distanceBetween(v1, v2);
	}
	
	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	InLineOfSight (start, end) {
		performance.mark('InLineOfSight()');

		let epsilon = 0.5;
		// let epsilon = Number.Epsilon;

		// Not in LOS if any of the ends is outside the polygon
		//NOTE: I dont think it needed
		performance.mark('checkInMainPoly()');
		// if( !this.polygons[0].pointInside(start) || !this.polygons[0].pointInside(end) ) {
		// 	performance.measure('checkInMainPoly', 'checkInMainPoly()');
		// 	performance.measure('InLineOfSight', 'InLineOfSight()');
		// 	return false;
		// }
		performance.measure('checkInMainPoly', 'checkInMainPoly()');

		// In LOS if it's the same start and end location
		performance.mark('checkInTooClose()');
		if( this.Distance(start, end) < epsilon ) {
			performance.measure('checkInTooClose', 'checkInTooClose()');
			performance.measure('InLineOfSight', 'InLineOfSight()');
			return true;
		}
		performance.measure('checkInTooClose', 'checkInTooClose()');
	
		// Not in LOS if any edge is intersected by the start-end line segment
		performance.mark('checkEdgesForCross()');
		for( let polygon of this.polygons ) {
			for( let i of Utils.range(polygon.vertices.length) ) {
				let v1 = polygon.vertices[i];
				let v2 = polygon.vertices[(i + 1) % polygon.vertices.length];
				if( this.LineSegmentsCross(start, end, v1, v2) ) {
					performance.measure('checkEdgesForCross', 'checkEdgesForCross()');
					performance.measure('InLineOfSight', 'InLineOfSight()');
					return false;
					//In some cases a 'snapped' endpoint is just a little over the line due to rounding errors. So a 0.5 margin is used to tackle those cases.
					if( polygon.distanceToSegment(start.x, start.y, v1.x, v1.y, v2.x, v2.y ) > epsilon && polygon.distanceToSegment(end.x, end.y, v1.x, v1.y, v2.x, v2.y ) > epsilon ) {
						performance.measure('checkEdgesForCross', 'checkEdgesForCross()');
						performance.measure('InLineOfSight', 'InLineOfSight()');
						return false;
					}
				}
			}
		}
		performance.measure('checkEdgesForCross', 'checkEdgesForCross()');

		performance.mark('checkMiddlePointInside()');
		// Finally the middle point in the segment determines if in LOS or not
		//TODO: WHAT?
		let middle = {x:(start.x + end.x) / 2, y:(start.y + end.y) / 2};//Vector.Add(start, end)/2;
		let inside = this.polygons[0].pointInside(middle);// Check main poly
		for( let i of Utils.range(this.polygons.length-1,1) ) {// Check others
			if( this.polygons[i].pointInside(middle, false) ) 
				inside = false;
		}
		performance.measure('checkMiddlePointInside', 'checkMiddlePointInside()');
		performance.measure('InLineOfSight', 'InLineOfSight()');
		return inside;
	}

	createGraph () {
		performance.mark('createGraph()');
		this.mainwalkgraph = new Graph();
		let first = true;
		this.vertices_concave = [];
		performance.mark('vertexCollect()');
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
		performance.measure('vertexCollect', 'vertexCollect()');

		performance.mark('selfCrossing()');
		this.vertices_concave.forEach( (v1, c1) => {
			this.vertices_concave.forEach( (v2, c2) => {
				if( this.InLineOfSight(v1, v2) ) {
					this.mainwalkgraph.addEdge(new GraphEdge(c1, c2, this.Distance(v1, v2)));
				}
			});
		});
		performance.measure('selfCrossing', 'selfCrossing()');
		performance.measure('createGraph', 'createGraph()');
	}
	
	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	LineSegmentsCross (a, b, c, d){
		performance.mark('LineSegmentsCross()');
		let denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
		if (denominator == 0) {
			performance.measure('LineSegmentsCross', 'LineSegmentsCross()');
			return false;
		}

		let numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
		let numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));
		if (numerator1 == 0 || numerator2 == 0) {
			performance.measure('LineSegmentsCross', 'LineSegmentsCross()');
			return false;
		}

		let r = numerator1 / denominator;
		let s = numerator2 / denominator;
		performance.measure('LineSegmentsCross', 'LineSegmentsCross()');
		return (r > 0 && r < 1) && (s > 0 && s < 1);
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
		performance.mark('calculatePath()');
		// console.log(from, to);
		//Clone the graph, so you can safely add new nodes without altering the original graph
		this.walkgraph = this.mainwalkgraph.clone();
		// Implements use of this const
		const mindistanceFrom = 100000;
		const mindistanceTo = 100000;

		//create new node on start position
		this.startNodeIndex = this.walkgraph.nodes.length;
		//TODO: Does we really need this check?
		// if( !this.polygons[0].pointInside(from) ) {
		// 	from = this.polygons[0].getClosestPointOnEdge(from);
		// }
		// if( !this.polygons[0].pointInside(to) ) {
		// 	to = this.polygons[0].getClosestPointOnEdge(to);
		// }


		//TODO: And what about this check?
		//Are there more polygons? Then check if endpoint is inside one of them and find closest point on edge
		// if( this.polygons.length > 1 ) {
		// 	for( let i of Utils.range(this.polygons.length-1, 1) ) {
		// 		if( this.polygons[i].pointInside(to) ) {
		// 			to = this.polygons[i].getClosestPointOnEdge(to);
		// 			break;
		// 		}
		// 	}
		// }
		
		this.targetx = to.x;
		this.targety = to.y;


		let startNode = new GraphNode({x:from.x, y:from.y});
		let startNodeVector = {x:startNode.pos.x, y:startNode.pos.y};
		this.walkgraph.addNode(startNode);

		this.vertices_concave.forEach( (v,i) => {
			if( this.InLineOfSight(startNodeVector, v) ) {
				this.walkgraph.addEdge(new GraphEdge(this.startNodeIndex, i, this.Distance(startNodeVector, v)));
			}			
		});


		//create new node on end position
		this.endNodeIndex = this.walkgraph.nodes.length;

		let endNode = new GraphNode({x:to.x, y:to.y});
		let endNodeVector = {x:endNode.pos.x, y:endNode.pos.y};
		this.walkgraph.addNode(endNode);

		this.vertices_concave.forEach( (v,i) => {
			if( this.InLineOfSight(endNodeVector, v) ) {
				this.walkgraph.addEdge(new GraphEdge(this.endNodeIndex, i, this.Distance(endNodeVector, v)));
			}			
		});
		if( this.InLineOfSight(startNodeVector, endNodeVector) ) {
			this.walkgraph.addEdge(new GraphEdge(this.startNodeIndex, this.endNodeIndex, this.Distance(startNodeVector, endNodeVector)));
		}
		
		//you can switch between A* and dijkstra algorithms by commenting one and uncommenting the other
		performance.mark('AstarAlgorithm()');		
		let astar = new AstarAlgorithm(this.walkgraph, this.startNodeIndex, this.endNodeIndex);
		this.calculatedpath = astar.getPath();
		performance.measure('AstarAlgorithm', 'AstarAlgorithm()');

		// let dijkstra = new DijkstraAlgorithm(this.walkgraph, this.startNodeIndex, this.endNodeIndex);
		// this.calculatedpath = dijkstra.getPath();
		
		performance.measure('calculatePath', 'calculatePath()');
		return this.calculatedpath;
	}

	getPathNodes (calculatedPath = undefined) {
		if( !calculatedPath ) {
			calculatedPath = this.calculatedpath;
		}
		// Change nodes index to nodes coordinates
		return calculatedPath.reduce( (a, n) => {
			return [...a, this.walkgraph.nodes[n].pos];
		}, []);
	}

}
