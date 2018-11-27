import { RULES } from './constants.js';
import Moves from './Moves.js';
import GameState from './GameState.js';

class Checkers {
	constructor(options = RULES) {

		this.size = options.size;
		this.firstMove = options.firstMove;
		this.captureBack = options.captureBack;
		this.flyingKings = options.flyingKings;
		this.automaticDrawAfterMoves = options.automaticDrawAfterMoves;

		this.validMoves = new Moves(options);
		this.gameState = new GameState({
			...options,
			currentPlayer: this.firstMove
		});
	}

	initGame() {
		this.gameState.createInitial();
		this.validMoves.findValidMoves(this.gameState.create2dArray(), this.gameState.currentPlayer);
		return this;
	}
}

let checkers = new Checkers(RULES).initGame().validMoves; /*?*/