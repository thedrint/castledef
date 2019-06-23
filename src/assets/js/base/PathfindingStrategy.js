import * as PIXI from 'pixi.js';
import { Game as GameSettings, FPS } from './../Settings';
import Utils from './../Utils';

export default class PathfindingStrategy {

	constructor(unit) {
		this.unit = unit;
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