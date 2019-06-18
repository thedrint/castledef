
// Import the game and settings for the game
import { Game } from './assets/js/Game';
import { Application as ApplicationSettings } from './assets/js/Settings';

// Create and start new game
let newGame = new Game(ApplicationSettings);
newGame.startGame();
