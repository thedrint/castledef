import * as PIXI from 'pixi.js';
import { Game as GameSettings, FPS } from './../Settings';

export default class PathfindingStrategy {
	constructor(unit) {
		this.unit = unit;
	}

	backwardStep () {
		let closest = this.unit.getClosest();
		let enemyFar = closest.enemy.distance >= GameSettings.unit.size;
		let friend = closest.friend;
		let friendFar = friend && (friend.distance >= GameSettings.unit.size);
		// If both nearest enemy and friend too far - move to enemy
		if( enemyFar && friendFar ){
			fighter.followTo(enemy, fighter.getSpeed()/FPS.target);
			return;
		}
		// If enemy too far but friend in close range - make step backward from friend to get more space for moves
		else if( friend && !friendFar && enemyFar ) {
			let speed = fighter.getSpeed()/FPS.target;
			let backwardPosition = new PIXI.Point(
				fighter.x - Math.sign(friend.x-fighter.x)*speed, 
				fighter.y - Math.sign(friend.y-fighter.y)*speed, 
			);
			fighter.followTo(backwardPosition, speed);
			return;
		}
	}
}