
import * as PIXI from 'pixi.js';
import * as TWEEN from 'es6-tween';
import * as Angle from 'yy-angle';

import { Game as GameSettings, Application as ApplicationSettings, FPS } from './../Settings';
import Utils from './../Utils';

import * as Constants from './../Constants';

export default class Container extends PIXI.Container {

	constructor () {
		super();
	}

	moveTo (target, speedInPixels = 1) {
		let lastCoords = {x:this.x, y:this.y};
		Utils.follow(this, target, speedInPixels);
		// if( this.x >= ApplicationSettings.width-GameSettings.unit.size || this.x < GameSettings.unit.size )
		// 	this.x = lastCoords.x;
		// if( this.y >= ApplicationSettings.height-GameSettings.unit.size || this.y < GameSettings.unit.size )
		// 	this.y = lastCoords.y;
	}

	rotateTo (rad) {
		this.rotation = Angle.normalize(rad);
	}

	rotateBy (rad) {
		this.rotation += rad;
		// Don't forget about normalizing angle
		if( Math.abs(this.rotation) > Angle.PI_2 ) {
			this.rotation = Angle.normalize(this.rotation);
		}
	}

	followTo (target, speedInPixels = undefined) {		
		if( !this.discreteRotate(Utils.getPointAngle(this, target)) )
			this.moveTo(target, speedInPixels);
		return this;
	}

	easeRotateTo(targetRotation) {
		this.discreteRotate(targetRotation);
		return this;
	}

	discreteRotate (targetRotation) {
		let angularVelocity = this.getAngularVelocity();
		let diff = Angle.differenceAngles(targetRotation, this.rotation);
		if( diff < Constants.ONE_DEGREE*2 ) 
			return false;// No need to rotate
		if( diff >= angularVelocity ) 
			this.rotateBy(Angle.differenceAnglesSign(targetRotation, this.rotation)*angularVelocity);
		else 
			this.rotateTo(targetRotation);
		return true;// Some rotate was doing
	}

	getAngularVelocity () { return Angle.PI_2/FPS.target; }

}
