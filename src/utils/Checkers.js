import { RULES, PLAYER_BLACK, PLAYER_WHITE } from './constants.js';
import Moves from './Moves.js';
import GameState from './GameState.js';
import { HumanPlayer, RandomAI } from './Player.js';
import { MovePath, Move } from './MoveClasses.js';

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

		this.gameState.isGameOver();

		if (this.gameState.gameOver) return;

		return this;
	}

	currentPlayerClass() {
		if (this.gameState.currentPlayer === PLAYER_BLACK) return this.playerBlack;
		else return this.playerWhite;
	}

	currentPlayerIsAI() {
		return !this.currentPlayerClass().isHuman;
	}

	requestAiMove() {
		let player = this.currentPlayerClass();
		player.setValidMoves(this.moves.validMoves);

		player.makeMove();
		return this;
	}

	_validatePath(path) {
		if (!(path instanceof MovePath)) {
			throw new Error("This is not a valid MovePath object!");
		}
		return this.moves.validMoves.isPathCurrentlyValid(path);
	}

	_validateMove(move) {
		if (!(move instanceof Move)) {
			throw new Error("This is not a valid move object!");
		}
		return this.moves.validMoves.isMoveCurrentlyValid(move);
	}

	makeMoveWithPath(path) {
		if (!this._validatePath(path)) {
			console.warn("Not a valid path!");
			return;
		}
		
		// Do entire move in one go. Might be useful?

		// gameState.doMovesInPath()
		// return this.initTurn()
	}

	makeSingleMove(move) {
		if (!this._validateMove(move)) {
			console.warn("Not a valid move!");
			return;
		}

		// Do single move from path
		// Check if was last move, else reduce all paths in ValidPaths with the last made move
		// if was last move, do this.initTurn()

		// gameState.doMove()
		let isFinished = this.moves.validMoves.reducePathsWithMove(move).finished;
		if (isFinished) {
			return this.initTurn();
		} else {
			console.log("There are still moves that can be made.");
			return this;
		}
	}

	makeMove(x0, y0, x1, y1) {
		if (!this.moves.isValidMove(x0, y0, x1, y1)) {
			console.warn("Not a valid move!");
			return;
		}

		let path = this.moves.getMovePath(x0, y0, x1, y1);
		console.log(path);
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