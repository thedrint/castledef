import Command from './Command';
import Utils from './../Utils';
import { Game as GameSettings, FPS } from './../Settings';

export class FollowTo extends Command {
	run () {
		let [enemy] = this.params;
		let result = this.rec.followTo(enemy);
		if( this.rec.sensor.isEnemyNear(enemy) ) 
			this.ended();
		return result;
	}
}

export class FollowByPath extends Command {
	constructor (receiver, name, ...params) {
		super(receiver, name, ...params);
		let [coords] = this.params;
		this.coords = coords.slice(0);
		this.currentTarget = this.coords.shift();
		this.startTime = performance.now();
	}

	run () {
		let result = this.rec.followTo(this.currentTarget);
		// If very-very close to target - go to next target or finish
		if( Utils.distanceBetween(this.rec, this.currentTarget) <= 2 ) {
			if( !this.coords.length )// It was last node in path - finish
				this.ended();
			else {
				this.currentTarget = this.coords.shift();
			}
		} 
		// Periodically check if unit inLOS enemy
		if( ((performance.now() - this.startTime) > 250) && this.rec.sensor.isEnemiesVisible() ) {
			this.ended();
			this.startTime = performance.now();
		}
		return result;
	}
}

export class ReturnToSpawnPoint extends Command {
	run () {
		let result = this.rec.followTo(this.rec.spawnPoint);
		if( Utils.distanceBetween(this.rec, this.rec.spawnPoint) <= 2 ) 
			this.ended();
		return result;
	}
}

export class GetPathTo extends Command {
	run () {
		let coords = this.rec.getPathTo(...this.params);
		this.rec.tactic.addCommand(this.rec.tactic.command(`FollowByPath`, coords));
		this.ended();
		return coords;
	}
}

export class WeaponPierce extends Command {
	run () {
		let [enemy] = this.params;
		this.rec.easeRotateTo(this.rec.getWeaponTargetAngle(enemy));
		let result = this.rec.Weapon.pierce(enemy);
		this.ended();
		return result;
	}
}
