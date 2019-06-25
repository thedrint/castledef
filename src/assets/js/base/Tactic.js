import * as PIXI from 'pixi.js';
import { Game as GameSettings, FPS } from './../Settings';
import Utils from './../Utils';

export default class Tactic {

	constructor(unit) {
		this.unit = unit;
		this.actions = [];// stack of actions
	}

	analyse () {
		let unit = this.unit;
		let {enemy, friend} = unit.sensor.getClosest();
		let enemyFar = enemy && (enemy.distance >= GameSettings.unit.size);
		let friendFar = friend && (friend.distance >= GameSettings.unit.size);
		// Without enemy unit can returns to home
		if( !enemy ) {
			return {action: `returnToSpawnPoint`};			
		}
		// If enemy far - two scenaries
		if( enemyFar ) {
			// In LOS unit can move toward - simple and shortest way
			if( unit.sensor.inLOS(enemy.unit) ) {
				return {action: `followTo`, params: [enemy.unit, unit.getSpeed()/FPS.target]};
			}
			else {
				return {action: `getPathTo`, params: [enemy.unit]};
			}
		}
		else {
			return {action: `pierce`, params: [enemy.unit]};
		}			
	}

	chooseAction () {
		let unit = this.unit;
		let closest = unit.getClosest();
		let enemyFar = closest.enemy.distance >= GameSettings.unit.size;
		let friend = closest.friend;
		let friendFar = friend && (friend.distance >= GameSettings.unit.size+32);
		if( friend ) {
			// If both nearest enemy and friend too far - move to enemy
			if( enemyFar && friendFar ){
				return {action: `followTo`, params: [closest.enemy.unit, unit.getSpeed()/FPS.target]};
			}
			else if( enemyFar && !friendFar ) {
				let obstacles = [];
				unit.scene.fighters.forEach( fighter => {
					if( fighter != unit )
						obstacles.push(fighter);
				});
				let lineOfSight = Utils.lineOfSight(unit, closest.enemy.unit, obstacles, GameSettings.unit.size);
				if( !lineOfSight ) {
					return {action: `backwardStep`, params: [friend.unit, unit.getSpeed()/FPS.target]};
				}
				else {
					return {action: `followTo`, params: [closest.enemy.unit, unit.getSpeed()/FPS.target]};
				}
			}
			else {
				return undefined;
			}
		}
		else {
			if( enemyFar ){
				return {action: `followTo`, params: [closest.enemy.unit, unit.getSpeed()/FPS.target]};
			}
			else {
				return undefined;
			}
		}
	}

}