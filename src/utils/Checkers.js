import { RULES } from './constants.js';
import Moves from './Moves.js';
import GameState from './GameState.js';

export default class Checkers {
	constructor(options = RULES) {

		this.size = options.size;
		this.firstMove = options.firstMove;
		this.captureBack = options.captureBack;
		this.flyingKings = options.flyingKings;
		this.automaticDrawAfterMoves = options.automaticDrawAfterMoves;

		this.moves = new Moves(options);
		this.gameState = new GameState({
			...options,
			currentPlayer: this.firstMove
		}, this.moves);
	}

	initGame() {
		this.gameState.createInitial();
		return this.initTurn();
	}

	initTurn() {
		this.moves.findValidMoves(this.gameState.create2dArray(), this.gameState.currentPlayer);
		return this;
	}
}

let checkers = new Checkers(RULES).initGame(); //?.
checkers.gameState.ascii(); //?