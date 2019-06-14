 import * as PIXI from 'pixi.js';
 import YyIntersects from 'yy-intersects';

 export default class IntersectHelper {
 	static get Circle () {
 		return YyIntersects.Circle;
 	}
 	static get Rectangle () {
 		return YyIntersects.Rectangle;
 	}

	static getShapeCenter (displayObject) {
		let localCenter = new PIXI.Point();
		if( displayObject.shape instanceof this.Circle ) {
			localCenter.set(0, 0);
		}
		else if ( displayObject.shape instanceof this.Rectangle ) {
			localCenter.set(displayObject.width/2, displayObject.height/2);
		}
		let worldCenter = displayObject.worldTransform.apply(localCenter, new PIXI.Point());
		return worldCenter;
	}

	//TODO: Move it to Game Utils too
	static getShapeTransform (displayObject) {
		let worldTransform = displayObject.worldTransform.decompose(new PIXI.Transform());
		return worldTransform;
	}

	static getShapeRotation (displayObject) {
		let worldTransform = this.getShapeTransform(displayObject);
		return worldTransform.rotation;
	}

	static updateIntersectShape (displayObject) {
		// console.log(`${displayObject.name} sizes`, displayObject.width, displayObject.height);

		let worldCenter = this.getShapeCenter(displayObject);
		let shapeUpdates = {};
		if( displayObject.shape instanceof this.Rectangle ) {
			shapeUpdates = {
				center         : worldCenter, 
				rotation       : this.getShapeTransform(displayObject)
			};
		}
		else if( displayObject.shape instanceof this.Circle ) {
			shapeUpdates = {
				positionObject : worldCenter, 
			};
		}

		// console.log(`${displayObject.name} shapeUpdates`, shapeUpdates);
		
		// .set() auto-updates AABB of object's shape
		displayObject.shape.set(shapeUpdates);

		// console.log(`${displayObject.name} updated shape`, displayObject.shape);
	}
}