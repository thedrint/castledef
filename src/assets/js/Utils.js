
import * as PIXI from 'pixi.js';
import * as FERMAT from '@mathigon/fermat'
import {geom} from 'jsts'

export default class Utils {

	constructor() {}

	/**
	 * This method filter plain-options object by defaults object by key, than merge filtered with defaults.
	 * @param  {Object} options  any plain object with options, like {a:123, b:456, c: 789}
	 * @param  {Object} defaults default values for allowed options, like {a: 'Allowed A', b: 123}
	 * @return {Object} merged objects where only allowed options, and all non-existent values replaced with defaults
	 */
	static cleanOptionsObject (options = {}, defaults = {}) {
		/* Thanks to https://stackoverflow.com/questions/38750705/filter-object-properties-by-key-in-es6 */
		// Get list of allowed options
		const allowedOptions = Object.keys(defaults);
		// Filter and create new option's object with only allowed options inside
		const filteredOptions = Object.keys(options)
			.filter(key => allowedOptions.includes(key))
			.reduce((obj, key) => {
				return {
					...obj,
					[key]: options[key]
				};
			}, {});

		// Merge default options with filtered and return this new object
		return Object.assign({}, defaults, filteredOptions);
	}

	/*
	distance
	----------------

	Find the distance in pixels between two sprites.
	Parameters: 
	a. A sprite object. 
	b. A sprite object. 
	The function returns the number of pixels distance between the sprites.

		 let distanceBetweenSprites = gu.distance(spriteA, spriteB);

	*/

	static distanceBetween (p1, p2) {
		return Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2));
	}

	static distance(s1, s2) {
		let vx = (s2.x + this._getCenter(s2, s2.width, "x")) - (s1.x + this._getCenter(s1, s1.width, "x")),
				vy = (s2.y + this._getCenter(s2, s2.height, "y")) - (s1.y + this._getCenter(s1, s1.height, "y"));
		return Math.sqrt(vx * vx + vy * vy);
	}

	static getLocal (o) {
		return new PIXI.Point(o.x, o.y);
	}

	static getLocalCenter (o) {
		let localCenter = new PIXI.Point();
		// console.log(`${o.name} x,y`, o.x, o.y);
		// console.log(`${o.name} pivot`, o.pivot);
		
		let b = o.getLocalBounds();
		// console.log(`${o.name} localBounds`, b);
		localCenter.set(b.x + b.width/2, b.y + b.height/2);
		// console.log(`${o.name} localCenter`, localCenter);
		return localCenter;
	}

	static getWorldCenter (o) {
		// console.log(o);
		let localCenter = this.getLocalCenter(o);
		let worldCenter = new PIXI.Point();

		

		//TODO: I dont know how but it updates world transform of object and all starts to work
		o.toGlobal(localCenter, worldCenter);
		// o.worldTransform.apply(localCenter, worldCenter);

		// console.log(`${o.name} worldTransform`, o.worldTransform);
		// console.log(`${o.name} worldCenter`, worldCenter);

		return worldCenter;
	}

	/*
	followEase
	----------------

	Make a sprite ease to the position of another sprite.
	Parameters: 
	a. A sprite object. This is the `follower` sprite.
	b. A sprite object. This is the `leader` sprite that the follower will chase.
	c. The easing value, such as 0.3. A higher number makes the follower move faster.

		 gu.followEase(follower, leader, speed);

	Use it inside a game loop.
	*/

	static followEase(follower, leader, speed) {

		//Figure out the distance between the sprites
		/*
		let vx = (leader.x + leader.width / 2) - (follower.x + follower.width / 2),
				vy = (leader.y + leader.height / 2) - (follower.y + follower.height / 2),
				distance = Math.sqrt(vx * vx + vy * vy);
		*/

		let vx = (leader.x + this._getCenter(leader, leader.width, "x")) - (follower.x + this._getCenter(follower, follower.width, "x")),
				vy = (leader.y + this._getCenter(leader, leader.height, "y")) - (follower.y + this._getCenter(follower, follower.height, "y")),
				distance = Math.sqrt(vx * vx + vy * vy);

		//Move the follower if it's more than 1 pixel
		//away from the leader
		if (distance >= 1) {
			follower.x += vx * speed;
			follower.y += vy * speed;
		}
	}

	/*
	followConstant
	----------------

	Make a sprite move towards another sprite at a constant speed.
	Parameters: 
	a. A sprite object. This is the `follower` sprite.
	b. A sprite object. This is the `leader` sprite that the follower will chase.
	c. The speed value, such as 3. The is the pixels per frame that the sprite will move. A higher number makes the follower move faster.

		 gu.followConstant(follower, leader, speed);

	*/

	static followConstant(follower, leader, speed) {

		//Figure out the distance between the sprites
		let vx = (leader.x + this._getCenter(leader, leader.width, "x")) - (follower.x + this._getCenter(follower, follower.width, "x")),
				vy = (leader.y + this._getCenter(leader, leader.height, "y")) - (follower.y + this._getCenter(follower, follower.height, "y")),
				distance = Math.sqrt(vx * vx + vy * vy);

		//Move the follower if it's more than 1 move
		//away from the leader
		if (distance >= speed) {
			follower.x += (vx / distance) * speed;
			follower.y += (vy / distance) * speed;
		}
	}

	static follow (follower, to, speed) {
		//Figure out the distance between the sprites
		let vx = (to.x) - (follower.x),
				vy = (to.y) - (follower.y),
				distance = Math.sqrt(vx * vx + vy * vy);

		//Move the follower if it's more than 1 move
		//away from the leader
		if (distance >= speed) {
			follower.x += (vx / distance) * speed;
			follower.y += (vy / distance) * speed;
		}
		if( distance - speed <= 1 ) {
			return true;
		}

		return false;
	}

	/*
	angle
	-----

	Return the angle in Radians between two sprites.
	Parameters: 
	a. A sprite object.
	b. A sprite object.
	You can use it to make a sprite rotate towards another sprite like this:

			box.rotation = gu.angle(box, pointer);

	*/

	static angle(s1, s2) {
		return Math.atan2(
			//This is the code you need if you don't want to compensate
			//for a possible shift in the sprites' x/y anchor points
			/*
			(s2.y + s2.height / 2) - (s1.y + s1.height / 2),
			(s2.x + s2.width / 2) - (s1.x + s1.width / 2)
			*/
			//This code adapts to a shifted anchor point
			(s2.y + this._getCenter(s2, s2.height, "y")) - (s1.y + this._getCenter(s1, s1.height, "y")),
			(s2.x + this._getCenter(s2, s2.width, "x")) - (s1.x + this._getCenter(s1, s1.width, "x"))
		);
	}

	static getAngle (s1, s2) {
		return Math.atan2(
			//This is the code you need if you don't want to compensate
			//for a possible shift in the sprites' x/y anchor points
			/*
			(s2.y + s2.height / 2) - (s1.y + s1.height / 2),
			(s2.x + s2.width / 2) - (s1.x + s1.width / 2)
			*/
			//This code adapts to a shifted anchor point
			(s2.y) - (s1.y + this._getCenter(s1, s1.height, "y")),
			(s2.x) - (s1.x + this._getCenter(s1, s1.width, "x"))
		);
	}

	static getPointAngle (p1, p2) {
		// console.log(p1.x, p1.y, p2.x, p2.y);
		return Math.atan2(
			(p2.y - p1.y),
			(p2.x - p1.x)
		);
	}

	/*
	_getCenter
	----------

	A utility that finds the center point of the sprite. If it's anchor point is the
	sprite's top left corner, then the center is calculated from that point.
	If the anchor point has been shifted, then the anchor x/y point is used as the sprite's center
	*/

	static _getCenter(o, dimension, axis) {
		if (o.anchor !== undefined) {
			if (o.anchor[axis] !== 0) {
				return 0;
			} else {
				//console.log(o.anchor[axis])
				return dimension / 2;
			}
		} 
		else if (o.pivot !== undefined) {
			if (o.pivot[axis] !== 0) {
				return o.pivot[axis];
			} else {
				return dimension / 2;
			}
		} 
		else {
			return dimension / 2;
		}
	}
	

	/*
	rotateAroundSprite
	------------
	Make a sprite rotate around another sprite.
	Parameters:
	a. The sprite you want to rotate.
	b. The sprite around which you want to rotate the first sprite.
	c. The distance, in pixels, that the roating sprite should be offset from the center.
	d. The angle of rotations, in radians.

		 gu.rotateAroundSprite(orbitingSprite, centerSprite, 50, angleInRadians);

	Use it inside a game loop, and make sure you update the angle value (the 4th argument) each frame.
	*/

	static rotateAroundSprite(rotatingSprite, centerSprite, distance, angle) {
		rotatingSprite.x
			= (centerSprite.x + this._getCenter(centerSprite, centerSprite.width, "x")) - rotatingSprite.parent.x
			+ (distance * Math.cos(angle))
			- this._getCenter(rotatingSprite, rotatingSprite.width, "x");

		rotatingSprite.y
			= (centerSprite.y + this._getCenter(centerSprite, centerSprite.height, "y")) - rotatingSprite.parent.y
			+ (distance * Math.sin(angle))
			- this._getCenter(rotatingSprite, rotatingSprite.height, "y");
	}

	/*
	rotateAroundPoint
	-----------------
	Make a point rotate around another point.
	Parameters:
	a. The point you want to rotate.
	b. The point around which you want to rotate the first point.
	c. The distance, in pixels, that the roating sprite should be offset from the center.
	d. The angle of rotations, in radians.

		 gu.rotateAroundPoint(orbitingPoint, centerPoint, 50, angleInRadians);

	Use it inside a game loop, and make sure you update the angle value (the 4th argument) each frame.

	*/

	static rotateAroundPoint(pointX, pointY, distanceX, distanceY, angle) {
		let point = {};
		point.x = pointX + Math.cos(angle) * distanceX;
		point.y = pointY + Math.sin(angle) * distanceY;
		return point;
	}


	/*
	randomInt
	---------

	Return a random integer between a minimum and maximum value
	Parameters: 
	a. An integer.
	b. An integer.
	Here's how you can use it to get a random number between, 1 and 10:

		 let number = gu.randomInt(1, 10);

	*/

	static randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/*
	randomFloat
	-----------

	Return a random floating point number between a minimum and maximum value
	Parameters: 
	a. Any number.
	b. Any number.
	Here's how you can use it to get a random floating point number between, 1 and 10:

			let number = gu.randomFloat(1, 10);

	*/

	static randomFloat(min, max) {
		return min + Math.random() * (max - min);
	}

	/*
	Wait
	----

	Lets you wait for a specific number of milliseconds before running the
	next function. 
	 
		gu.wait(1000, runThisFunctionNext());
	
	*/

	static wait(duration, callBack) {
		setTimeout(callBack, duration);
	}

	/*
	Move
	----

	Move a sprite by adding it's velocity to it's position. The sprite 
	must have `vx` and `vy` values for this to work. You can supply a
	single sprite, or a list of sprites, separated by commas.

			gu.move(sprite);
	*/

	static move(...sprites) {

		//Move sprites that's aren't in an array
		if (!(sprites[0] instanceof Array)) {
			if (sprites.length > 1) {
				sprites.forEach(sprite  => {
					sprite.x += sprite.vx;
					sprite.y += sprite.vy;
				});
			} else {
				sprites[0].x += sprites[0].vx;
				sprites[0].y += sprites[0].vy;
			}
		}

		//Move sprites in an array of sprites
		else {
			let spritesArray = sprites[0];
			if (spritesArray.length > 0) {
				for (let i = spritesArray.length - 1; i >= 0; i--) {
					let sprite = spritesArray[i];
					sprite.x += sprite.vx;
					sprite.y += sprite.vy;
				}
			}
		}
	}


	/*
	World camera
	------------

	The `worldCamera` method returns a `camera` object
	with `x` and `y` properties. It has
	two useful methods: `centerOver`, to center the camera over
	a sprite, and `follow` to make it follow a sprite.
	`worldCamera` arguments: worldObject, theCanvas
	The worldObject needs to have a `width` and `height` property.
	*/

	static worldCamera(world, worldWidth, worldHeight, canvas) {

		//Define a `camera` object with helpful properties
		let camera = {
			width: canvas.width,
			height: canvas.height,
			_x: 0,
			_y: 0,

			//`x` and `y` getters/setters
			//When you change the camera's position,
			//they shift the position of the world in the opposite direction
			get x() {
				return this._x;
			},
			set x(value) {
				this._x = value;
				world.x = -this._x;
				//world._previousX = world.x;
			},
			get y() {
				return this._y;
			},
			set y(value) {
				this._y = value;
				world.y = -this._y;
				//world._previousY = world.y;
			},

			//The center x and y position of the camera
			get centerX() {
				return this.x + (this.width / 2);
			},
			get centerY() {
				return this.y + (this.height / 2);
			},

			//Boundary properties that define a rectangular area, half the size
			//of the game screen. If the sprite that the camera is following
			//is inide this area, the camera won't scroll. If the sprite
			//crosses this boundary, the `follow` function ahead will change
			//the camera's x and y position to scroll the game world
			get rightInnerBoundary() {
				return this.x + (this.width / 2) + (this.width / 4);
			},
			get leftInnerBoundary() {
				return this.x + (this.width / 2) - (this.width / 4);
			},
			get topInnerBoundary() {
				return this.y + (this.height / 2) - (this.height / 4);
			},
			get bottomInnerBoundary() {
				return this.y + (this.height / 2) + (this.height / 4);
			},

			//The code next defines two camera 
			//methods: `follow` and `centerOver`

			//Use the `follow` method to make the camera follow a sprite
			follow: function(sprite) {

				//Check the sprites position in relation to the inner
				//boundary. Move the camera to follow the sprite if the sprite 
				//strays outside the boundary
				if(sprite.x < this.leftInnerBoundary) {
					this.x = sprite.x - (this.width / 4);
				}
				if(sprite.y < this.topInnerBoundary) {
					this.y = sprite.y - (this.height / 4);
				}
				if(sprite.x + sprite.width > this.rightInnerBoundary) {
					this.x = sprite.x + sprite.width - (this.width / 4 * 3);
				}
				if(sprite.y + sprite.height > this.bottomInnerBoundary) {
					this.y = sprite.y + sprite.height - (this.height / 4 * 3);
				}

				//If the camera reaches the edge of the map, stop it from moving
				if(this.x < 0) {
					this.x = 0;
				}
				if(this.y < 0) {
					this.y = 0;
				}
				if(this.x + this.width > worldWidth) {
					this.x = worldWidth - this.width;
				}
				if(this.y + this.height > worldHeight) {
					this.y = worldHeight - this.height;
				}
			},

			//Use the `centerOver` method to center the camera over a sprite
			centerOver: function(sprite) {

				//Center the camera over a sprite
				this.x = (sprite.x + sprite.halfWidth) - (this.width / 2);
				this.y = (sprite.y + sprite.halfHeight) - (this.height / 2);
			}
		};
		
		//Return the `camera` object 
		return camera;
	}

	/*
	Line of sight
	------------

	The `lineOfSight` method will return `true` if there’s clear line of sight 
	between two sprites, and `false` if there isn’t. Here’s how to use it in your game code:

			monster.lineOfSight = gu.lineOfSight(
					monster, //Sprite one
					alien,   //Sprite two
					boxes,   //An array of obstacle sprites
					16       //The distance between each collision point
			);

	The 4th argument determines the distance between collision points. 
	For better performance, make this a large number, up to the maximum 
	width of your smallest sprite (such as 64 or 32). For greater precision, 
	use a smaller number. You can use the lineOfSight value to decide how 
	to change certain things in your game. For example:

			if (monster.lineOfSight) {
				monster.show(monster.states.angry)
			} else {
				monster.show(monster.states.normal)
			}

	*/

	static lineOfSight(
		s1, //The first sprite, with `centerX` and `centerY` properties
		s2, //The second sprite, with `centerX` and `centerY` properties
		obstacles, //An array of sprites which act as obstacles
		segment = 32 //The distance between collision points
	) {

		//Calculate the center points of each sprite
		let spriteOneCenterX = s1.x + this._getCenter(s1, s1.width, "x");
		let spriteOneCenterY = s1.y + this._getCenter(s1, s1.height, "y");
		let spriteTwoCenterX = s2.x + this._getCenter(s2, s2.width, "x");
		let spriteTwoCenterY = s2.y + this._getCenter(s2, s2.height, "y");

		//Plot a vector between spriteTwo and spriteOne
		let vx = spriteTwoCenterX - spriteOneCenterX,
			vy = spriteTwoCenterY - spriteOneCenterY;

		//Find the vector's magnitude (its length in pixels)
		let magnitude = Math.sqrt(vx * vx + vy * vy);

		//How many points will we need to test?
		let numberOfPoints = magnitude / segment;

		//Create an array of x/y points, separated by 64 pixels, that
		//extends from `spriteOne` to `spriteTwo`  
		let points = () => {

			//Initialize an array that is going to store all our points
			//along the vector
			let arrayOfPoints = [];

			//Create a point object for each segment of the vector and 
			//store its x/y position as well as its index number on
			//the map array 
			for (let i = 1; i <= numberOfPoints; i++) {

				//Calculate the new magnitude for this iteration of the loop
				let newMagnitude = segment * i;

				//Find the unit vector. This is a small, scaled down version of
				//the vector between the sprites that's less than one pixel long.
				//It points in the same direction as the main vector, but because it's
				//the smallest size that the vector can be, we can use it to create
				//new vectors of varying length
				let dx = vx / magnitude,
					dy = vy / magnitude;

				//Use the unit vector and newMagnitude to figure out the x/y
				//position of the next point in this loop iteration
				let x = spriteOneCenterX + dx * newMagnitude,
					y = spriteOneCenterY + dy * newMagnitude;

				//Push a point object with x and y properties into the `arrayOfPoints`
				arrayOfPoints.push({
					x, y
				});
			}

			//Return the array of point objects
			return arrayOfPoints;
		};

		//Test for a collision between a point and a sprite
		let hitTestPoint = (point, sprite) => {

			//Find out if the point's position is inside the area defined
			//by the sprite's left, right, top and bottom sides
			let left = point.x > sprite.x,
				right = point.x < (sprite.x + sprite.width),
				top = point.y > sprite.y,
				bottom = point.y < (sprite.y + sprite.height);

			//If all the collision conditions are met, you know the
			//point is intersecting the sprite
			return left && right && top && bottom;
		};

		//The `noObstacles` function will return `true` if all the tile
		//index numbers along the vector are `0`, which means they contain 
		//no obstacles. If any of them aren't 0, then the function returns
		//`false` which means there's an obstacle in the way 
		let noObstacles = points().every(point => {
			return obstacles.every(obstacle => {
				return !(hitTestPoint(point, obstacle))
			});
		});

		//Return the true/false value of the collision test
		return noObstacles;
	}

	/**
	 * Returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
	 * jsts implementation - it works
	 * @param ...points first 4 points for first line segment, next 4 for second line segment
	 * @return bool 
	 */
	static linesIntersect (...points)
	{
		let [a, b, c, d, p, q, r, s] = points;
		// console.log(`a, b, c, d, p, q, r, s`, a, b, c, d, p, q, r, s);
		let s1 = new geom.LineSegment(new geom.Coordinate(a,b), new geom.Coordinate(c,d));
		let s2 = new geom.LineSegment(new geom.Coordinate(p,q), new geom.Coordinate(r,s));
		return s1.intersection(s2);
	}

	static unique () {
		return `f${(~~(Math.random()*1e8)).toString(16)}`;
	}

	static range (size = 1, start = 0) {
		return [...Array(size).keys()].map(i => i + start);
	}

	/**
	 * Make from flat array new array of coordinate objects
	 * Each letters in dimensions is a one dimension. 'xy' represents 2d, 'xyz' represents 3d coordinates
	 * Possible to use to convert flat matrix arrays, use 'abcdefxyw' for 2d matrix for example
	 * 
	 * @use let coords = Utils.flatToCoords([0,0, 10,10, ...]);// [{x:0,y:0}, {x:10,y:10}, ...];
	 * @use let coords = Utils.flatToCoords([0,0,0, 10,10,10, ...], 'xyz');// [{x:0,y:0,z:0}, {x:10,y:10,z:10}, ...];
	 * 
	 * @param  {Array}  flatCoords - coordinates in flat view. Vertices for example
	 * @param  {String} dimensions - Describes used axis of element of new array. 'xy' by default
	 * @return {Array}            [description]
	 */
	static flatToCoords (flatCoords = [], dims = 'xy') {
		return flatCoords.reduce( (ac, v, i, ar) => {
			if( i%dims.length == 0 ) {
				ac.push(Array.from(dims).reduce((c,d,j) => {return Object.assign(c,{[d]:ar[i+j]})},{}));
			}
			return ac
		}, []);
	}
	//TODO: Make this alias as main function in code
	static atoc (flatCoords = [], dims = 'xy') {
		return flatCoords.reduce( (ac, v, i, ar) => {
			if( i%dims.length == 0 ) {
				ac.push(Array.from(dims).reduce((c,d,j) => {return Object.assign(c,{[d]:ar[i+j]})},{}));
			}
			return ac
		}, []);
	}

	static perfTest (name = 'perfTest', times = 1, code = () => {}, showIterations = false) {
		if( typeof code != 'function' ) return false;

		let test = {n:times,name:name};
		performance.mark(test.name);
		Utils.range(test.n).forEach((i) => {
			if( showIterations ) console.log(`${test.name} #${i+1}`);
			code();
		});
		performance.measure(`${test.name} measure`, test.name);
		test.result = performance.getEntriesByName(`${test.name} measure`)[0];
		// performance.clearMarks();
		// performance.clearMeasures();
		return test;
	}

	static sumPerf (name) {
		return performance.getEntriesByName(name).reduce((a,v) => {return a + v.duration}, 0);
	}

	static avgPerf (name) {
		let perf = performance.getEntriesByName(name);
		return perf.reduce((a,v) => {return a + v.duration}, 0)/perf.length;
	}

}
