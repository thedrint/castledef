
import Konva from 'konva';

export default class Engine {
	constructor (containerId = 'Game', width = 600, height = 480) {
		this.stage = new Konva.Stage({
			container: containerId,
			width: width,
			height: height,
		});

		let layer = new Konva.Layer();

		let circle = new Konva.Circle({
			x: stage.width() / 2,
			y: stage.height() / 2,
			radius: 70,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4
		});

		layer.add(circle);
		this.stage.add(layer);

		layer.draw();
	}
}