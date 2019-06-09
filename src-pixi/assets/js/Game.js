
import Phaser from 'phaser';
import { gameInternalSettings, FPSConfig } from './GameSettings';
import PlayGame from './scenes/PlayGame';

const gameConfig = {
	width: 640,
	height: 480,
	type: Phaser.AUTO,
	scene: PlayGame,
	title: `CastleDef`,
	url: `https://drint.ru`,
	version: `0.0.1`,
	backgroundColor: 0xffffff,
	fps: FPSConfig,
}

export default class Game extends Phaser.Game {

	constructor () {
		super(gameConfig)
	}
}