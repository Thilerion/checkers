import { RULES, PLAYER_BLACK, PLAYER_WHITE } from './constants.js';
import Moves from './Moves.js';
import GameState from './GameState.js';
import { HumanPlayer, RandomAI } from './Player.js';

export default class Checkers {
	constructor(options = RULES, WhiteClass = HumanPlayer, BlackClass = HumanPlayer) {

		this.size = options.size;
		this.firstMove = options.firstMove;
		this.captureBack = options.captureBack;
		this.flyingKings = options.flyingKings;
		this.autoDrawAfterNoCaptures = options.autoDrawAfterNoCaptures;

		this.playerWhite = new WhiteClass(PLAYER_WHITE, this.makeMove.bind(this));
		this.playerBlack = new BlackClass(PLAYER_BLACK, this.makeMove.bind(this));

		this.moves = new Moves(options);
		this.gameState = new GameState(
			{
				...options,
				startingPlayer: this.firstMove,
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

		console.warn({ gameOver: this.gameState.isGameOver() });

		if (this.gameState.gameOver) return;

		if (this.currentPlayerIsAI) {
			return this.requestAiMove();
		} else {
			return this;
		}
	}

	currentPlayerClass() {
		if (this.gameState.currentPlayer === PLAYER_BLACK) return this.playerBlack;
		else return this.playerWhite;
	}

	currentPlayerIsAI() {
		return !this.currentPlayerClass.isHuman;
	}

	requestAiMove() {
		let player = this.currentPlayerClass();

		player.setValidMoves(this.moves.validMoves);
		setTimeout(() => {
			player.makeMove();
		}, 1000);
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

	unmakeMove() {
		this.gameState._undoMove();

		return this.initTurn();
	}

	importGame(pieces, startingPlayer) {
		this.gameState = new GameState(
			{
				size: this.size,
				startingPlayer,
				autoDrawAfterNoCaptures: this.autoDrawAfterNoCaptures
			},
			this.moves
		)._importBoard(pieces);
		return this.initTurn();
	}
}

// let checkers = new Checkers(RULES).initGame(); //?.
// checkers.gameState.ascii(); //?