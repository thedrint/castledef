
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
		let angularVelocity = Angle.PI_2/FPS.target;
		let targetAngle = Utils.getPointAngle(this, target);
		let diff = Angle.differenceAngles(targetAngle, this.rotation);
		let sign = Angle.differenceAnglesSign(targetAngle, this.rotation);
		if( diff > Constants.ONE_DEGREE * 5 ) {
			if( diff >= angularVelocity ) {
				this.rotateBy(sign*angularVelocity);
			}
			else {
				this.rotateTo(targetAngle);
			}			
		}
		else {
			this.moveTo(target, speedInPixels);
		}

		return this;
	}

	easeRotateTo(targetAngle) {
		let angularVelocity = Angle.PI_2/FPS.target;
		let diff = Angle.differenceAngles(targetAngle, this.rotation);
		let sign = Angle.differenceAnglesSign(targetAngle, this.rotation);
		if( diff > Constants.ONE_DEGREE * 5 ) {
			if( diff >= angularVelocity ) {
				this.rotateBy(sign*angularVelocity);
			}
			else {
				this.rotateTo(targetAngle);
			}			
		}

		return this;
	}

	getAngleTo(target) {

	}

}
