
import * as PIXI from 'pixi.js';
import { Game as GameSettings, FPS } from './Settings';
import Utils from './Utils';
import Scene from './Scene';

export default class Sensor {

	constructor (unit) {
		this.unit = unit;
	}

	getLOS (target) {
		return {
			start : this.unit.getCenter(),
			end   : target.getCenter()
		};
	}


	inLOS (target) {
		return this.unit.scene.map.InLineOfSight({x:this.x, y:this.y}, {x:target.x, y:target.y});
	}

	getClosest () {
		//TODO: Implements caching
		let closest = {enemy:undefined, friend:undefined};

		for( let unit of this.unit.scene.fighters ) {
			if( unit == this.unit || unit.isDied() )
				continue;

			let distance = Utils.distance(this.unit, unit);
			let isEnemy = ( unit.party != this.unit.party );
			if( isEnemy ) {
				if( !closest.enemy || closest.enemy.distance > distance ) {
					closest.enemy = {unit, distance};
				}
			}
			else {
				if( !closest.friend || closest.friend.distance > distance ) {
					closest.friend = {unit, distance};
				}
			}
		}

		return closest;
	}

}