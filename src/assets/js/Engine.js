
import Konva from 'konva';

export default class Engine {
	constructor (containerId = 'Game', width = window.innerWidth, height = window.innerHeight) {
		this.stage = new Konva.Stage({
			container: containerId,
			width: width,
			height: height,
		});

		let layer = new Konva.Layer();

		let unit = new Konva.Circle({
			x: this.stage.width() / 2,
			y: this.stage.height() / 2,
			radius: 16,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 1
		});

		layer.add(unit);
		this.stage.add(layer);

		layer.draw();
	}
}