import { RULES } from './constants.js';
import Moves from './Moves.js';
import GameState from './GameState.js';

export default class Checkers {
	constructor(options = RULES) {

		this.size = options.size;
		this.firstMove = options.firstMove;
		this.captureBack = options.captureBack;
		this.flyingKings = options.flyingKings;
		this.autoDrawAfterNoCaptures = options.autoDrawAfterNoCaptures;

		this.moves = new Moves(options);
		this.gameState = new GameState(
			{
				...options,
				currentPlayer: this.firstMove,
				autoDrawAfterNoCaptures: this.autoDrawAfterNoCaptures
			},
			this.moves
		);
	}

	initGame() {
		this.gameState.createInitial();
		return this.initTurn();
	}

	initTurn() {
		this.moves.findValidMoves(this.gameState.create2dArray(), this.gameState.currentPlayer);
		return this;
	}

	makeMove(x0, y0, x1, y1) {
		if (!this.moves.isValidMove(x0, y0, x1, y1)) {
			console.warn("Not a valid move!");
			return;
		}

		let path = this.moves.getMovePath(x0, y0, x1, y1);
		this.gameState._doMove(x0, y0, path);

		return this.initTurn();
	}
}

let checkers = new Checkers(RULES).initGame(); //?.
checkers.gameState.ascii(); //?