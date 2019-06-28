
import * as PIXI from 'pixi.js';
import Utils from './Utils';
import { Game as GameSettings } from './Settings';

export default class Sensor {

	constructor (unit) {
		this.unit = unit;
		this.closest = {enemy:undefined, friend:undefined};
	}

	getLOS (target) {
		return {
			start : this.unit.getCenter(),
			end   : target.getCenter()
		};
	}

	inLOS (target) {
		return this.unit.scene.map.InLineOfSight({x:this.unit.x, y:this.unit.y}, {x:target.x, y:target.y});
	}

	isClosestEnemyVisible (closestEnemy = undefined) {
		let enemy = closestEnemy || this.getClosestEnemy();
		return ( enemy && this.inLOS(enemy.unit) );
	}

	isClosestEnemyNear (closestEnemy = undefined) {
		let enemy = closestEnemy || this.getClosestEnemy();
		return ( enemy && (enemy.distance <= GameSettings.unit.size*2) );
	}

	isEnemyVisible (enemy) {
		return this.inLOS(enemy);
	}

	isEnemyNear (enemy) {
		return (this.getDistanceTo(enemy) <= GameSettings.unit.size*2 );
	}

	isEnemiesVisible () {
		for( let party of this.unit.scene.party.parties.values() ) {
			if( this.unit.party == party ) continue;// Skip unit party
			for( let unit of party.units ) {
				if( unit.isDied() ) continue;// Skip deads
				if( this.inLOS(unit) )
					return true;
			}
		}
		return false;
	}

	isEnemiesNear () {//TODO: implement
		let enemy = this.getClosestEnemy();
		return ( enemy && (enemy.distance <= GameSettings.unit.size*2) );
	}

	getDistanceTo (unit) {
		return Utils.distanceBetween(this.unit, unit);
	}

	getEnemyParties () {
		return Array.from(this.unit.scene.party.parties.values()).filter( party => party != this.unit.party );
	}

	getClosest () {
		//TODO: Implements caching
		let closest = {enemy:undefined, friend:undefined};
		for( let unit of this.unit.scene.fighters ) {
			if( unit == this.unit || unit.isDied() )
				continue;

			let distance = Utils.distanceBetween(this.unit, unit);
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
		this.closest = closest;
		return closest;
	}

	getClosestEnemy () {
		let closest = undefined;
		this.getEnemyParties().forEach( party => {
			party.units.forEach( unit => {
				if( unit.isDied() ) return;// Skip deads
				let distance = Utils.distanceBetween(this.unit, unit);
				if( !closest || closest.distance > distance ) {
					closest = {unit, distance};
				}
			});
		});
		this.closest.enemy = closest;
		return closest;
	}

	getClosestFriend () {
		let closest = undefined;
		this.unit.party.units.forEach( unit => {
			if( unit.isDied() ) return;// Skip deads
			let distance = Utils.distanceBetween(this.unit, unit);
			if( !closest || closest.distance > distance ) {
				closest = {unit, distance};
			}
		});
		this.closest.friend = closest;
		return closest;
	}

}
