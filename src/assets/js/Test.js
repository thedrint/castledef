
import Utils from './Utils';
import Colors from './Colors';

export default class Test {

	constructor () {}

	static getPath (JohnWick, BadGuy) {
		let pathCoords = [];
		let testCode = () => {
			// this.getMap(true);
			pathCoords = JohnWick.getPathTo(BadGuy);
		}

		let res = Utils.perfTest('create map and calculate path', 10, testCode);
		console.log(`${res.name} in ${res.result.duration/res.n}ms (${res.result.duration}ms for ${res.n} tests)`);

		JohnWick.scene.drawPath(JohnWick, Colors.pink, 16, ...pathCoords);

		let measures = [
			'checkInMainPoly', 
			'checkInTooClose', 
			'checkMiddlePointInside', 
			'checkEdgesForCross', 
			'InLineOfSight', 
			'selfCrossing', 
			'vertexCollect', 
			'calculatePath', 
			'AstarAlgorithm', 
			'pointInside', 
			'LineSegmentsCross', 
		];
		let table = measures
			.reduce((a,v)=>{ return [...a,[v,Utils.sumPerf(v)/res.n]] }, []);
		table.push(['createGraph', Utils.avgPerf('createGraph')]);
		console.table(table);
	}

	static seekAndDestroy (scene) {
		Utils.perfTest(`seekAndDestroy`, 10, (iteration) => {
			scene.fighters.forEach( fighter => {
				scene.seekAndDestroy(fighter);
			});
		}, false);
		console.log('Test completed!!!');
	}

	static getWeaponAngle (JohnWick, BadGuy) {
		JohnWick.getWeaponTargetAngle(BadGuy);
	}

}