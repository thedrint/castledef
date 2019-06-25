
import Utils from './../Utils';
export default class Polygon {
	
	constructor (...coords) {
		this.vertices = ( coords.length ? coords : [] );// array of points
	}
	
	addPoint (x, y) {
		let v = {x:x, y:y};
		this.vertices.push(v);
		return v;
	}
	
	//ported from http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/
	pointInside(point, toleranceOnOutside = true) {
		performance.mark('pointInside()');

		let epsilon = 0.5;
		// let epsilon = Number.EPSILON;

		let inside = false;
		// Must have 3 or more edges
		if( this.vertices.length < 3 ) {
			performance.measure('pointInside', 'pointInside()');
			return false;
		}

		let oldPoint = this.vertices[this.vertices.length - 1];
		let oldSqDist = this.DistanceSquared(oldPoint.x, oldPoint.y, point.x, point.y);

		this.vertices.forEach( v => {
			let newPoint = v;
			let newSqDist = this.DistanceSquared(newPoint.x, newPoint.y, point.x, point.y);

			if( 
				oldSqDist + newSqDist 
				+ 2.0 * Math.sqrt(oldSqDist * newSqDist) 
				- this.DistanceSquared(newPoint.x, newPoint.y, oldPoint.x, oldPoint.y) 
					< epsilon 
			) {
				performance.measure('pointInside', 'pointInside()');
				return toleranceOnOutside;
			}

			let left, right;
			if( newPoint.x > oldPoint.x ) {
				left = oldPoint;
				right = newPoint;
			}
			else {
				left = newPoint;
				right = oldPoint;
			}
			//WTF?
			if( 
				left.x < point.x && 
				point.x <= right.x && 
				(point.y-left.y)*(right.x-left.x) < (right.y-left.y)*(point.x-left.x)
			) {
				inside = !inside;
			}

			oldPoint = newPoint;
			oldSqDist = newSqDist;
		});

		performance.measure('pointInside', 'pointInside()');
		return inside;
	}
	
	DistanceSquared(vx, vy, wx, wy) { 
		return (vx - wx)*(vx - wx) + (vy - wy)*(vy - wy);
	}
	
	
	distanceToSegmentSquared(px, py, vx, vy, wx, wy) {
		let l2 = this.DistanceSquared(vx,vy,wx,wy);
		if (l2 == 0) return this.DistanceSquared(px, py, vx, vy);
		let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
		if (t < 0) return this.DistanceSquared(px, py, vx, vy);
		if (t > 1) return this.DistanceSquared(px, py, wx, wy);
		return this.DistanceSquared(px, py, vx + t * (wx - vx), vy + t * (wy - vy));
	}
	
	distanceToSegment(px, py, vx, vy, wx, wy) { 
		return Math.sqrt(this.distanceToSegmentSquared(px, py, vx, vy, wx, wy));
	}
	
	getClosestPointOnEdge(p3) {
		let tx = p3.x;
		let ty = p3.y;
		let vi1 = -1;
		let vi2 = -1;
		let mindist = 100000;
		
		for( let i of Utils.range(this.vertices.length) ) {
			let dist = this.distanceToSegment(tx, ty, this.vertices[i].x, this.vertices[i].y, this.vertices[(i + 1) % this.vertices.length].x, this.vertices[(i + 1) % this.vertices.length].y);
			if (dist < mindist) {
				mindist = dist;
				vi1 = i;
				vi2 = (i + 1) % this.vertices.length;
			}
		}
		let p1 = this.vertices[vi1];
		let p2 = this.vertices[vi2];

		let x1 = p1.x;
		let y1 = p1.y;
		let x2 = p2.x;
		let y2 = p2.y;
		let x3 = p3.x;
		let y3 = p3.y;

		let u = (((x3 - x1) * (x2 - x1)) + ((y3 - y1) * (y2 - y1))) / (((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

		let xu = x1 + u * (x2 - x1);
		let yu = y1 + u * (y2 - y1);
		
		let linevector;
		if (u < 0) linevector = {x:x1, y:y1};
		else if (u>1) linevector = {x:x2, y:y2};
		else linevector = {x:xu, y:yu};
		
		return linevector;
	}
}
