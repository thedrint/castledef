
import * as PIXI from 'pixi.js';
import Utils from './Utils';

import Command from './command/Command';
import CommandPool from './command/CommandPool';
import * as UnitCommand from './command/UnitCommand';

export default class Tactic {

	constructor(unit) {
		this.unit = unit;
		this.pool = new CommandPool();// queue of actions
	}

	hasCommands () {
		return this.pool.length > 0;
	}

	addCommand (com) {
		return this.pool.add(com);
	}

	// Simplify creating of command object
	command (name = '', ...params) {
		return new UnitCommand[name](this.unit, name, ...params);
	}

	execute () {
		return this.pool.executeCurrent();
	}

	analyse () {
		let unit   = this.unit;
		let enemy  = unit.sensor.getClosestEnemy();
		// let friend = unit.sensor.getClosestFriend();
		let enemyFar = !unit.sensor.isClosestEnemyNear(enemy);
		// let friendFar = friend && (friend.distance >= GameSettings.unit.size+2);
		// Without enemy unit can returns to home
		if( !enemy ) {
			// In LOS unit can move toward - simple and shortest way
			if( unit.sensor.inLOS(unit.spawnPoint) ) {
				return this.command(`ReturnToSpawnPoint`);
			}
			else {
				return this.command(`GetPathTo`, unit.spawnPoint);
			}
		}
		// If enemy far - two scenaries
		if( enemyFar ) {
			// In LOS unit can move toward - simple and shortest way
			if( unit.sensor.inLOS(enemy.unit) ) {
				return this.command(`FollowTo`, enemy.unit);
			}
			else {
				return this.command(`GetPathTo`, enemy.unit);
			}
		}
		else {
			return this.command(`WeaponPierce`, enemy.unit);
		}			
	}

}