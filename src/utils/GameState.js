import { NO_PIECE, PIECES, PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, PIECE_MAN, GET_PIECE_PLAYER, GET_PIECE_TYPE, TIE } from './constants.js';
import Piece from './Piece.js';

export default class GameState {
	constructor(options, moves) {
		const { size, startingPlayer, autoDrawAfterNoCaptures } = options;

		this.size = size;
		this.pieces = [];
		this.history = [];

		this.startingPlayer = startingPlayer;
		this.currentPlayer = startingPlayer;
		this.moveNumber = 0;	
		
		this.moves = moves;

		this.autoDrawAfterNoCaptures = autoDrawAfterNoCaptures;
		this.noCaptureCounter = 0;

		this.gameOver = false;
		this.winner = null;
	}

	_importBoard(pieces) {
		this.pieces = pieces.map(([x, y, typeId]) => {
			console.log(x, y, typeId);
			return new Piece(x, y, typeId);
		});
				
		return this;
	}

	_hasMoves() {
		return this.moves.validMoves.length > 0;
	}

	_playerPiecesLeft(player) {
		return this.pieces.filter(piece => piece.player === player && piece.alive);
	}

	_piecesLeft() {
		const blackPieces = this._playerPiecesLeft(PLAYER_BLACK);
		const blackKings = blackPieces.filter(piece => piece.isKing());

		const whitePieces = this._playerPiecesLeft(PLAYER_WHITE);
		const whiteKings = blackPieces.filter(piece => piece.isKing());

		return {
			blackTotal: blackPieces.length,
			whiteTotal: whitePieces.length,
			kingBlack: blackKings.length,
			kingWhite: whiteKings.length,
			manBlack: blackPieces.length - blackKings.length,
			manWhite: whitePieces.length - whiteKings.length
		};
	}

	isGameOver() {
		// returns true if game has ended because no more moves,
		// 		no more pieces, or one of the draw conditions

		// No more moves? Enemy wins
		if (!this.gameOver && !this._hasMoves) {
			this.gameOver = true;
			this.winner = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		}

		// No more pieces? Enemy wins
		const piecesLeft = this._piecesLeft();
		if (!this.gameOver && piecesLeft.blackTotal <= 0) {
			this.gameOver = true;
			this.winner = PLAYER_WHITE;
		} else if (!this.gameOver && piecesLeft.whiteTotal <= 0) {
			this.gameOver = true;
			this.winner = PLAYER_BLACK;
		}

		// No captures for more moves than allowed? Draw
		if (!this.gameOver && this.noCaptureCounter >= this.autoDrawAfterNoCaptures) {
			this.gameOver = true;
			this.winner = TIE;
		}		

		return this.gameOver;
	}

	_createPiece(x, y, typeId) {
		// let player = GET_PIECE_PLAYER(typeId);
		// let type = GET_PIECE_TYPE(typeId);
		
		// return { x, y, typeId, type, alive: true, player };
		return new Piece(x, y, typeId);
	}

	createInitial() {
		this.pieces = [];
		let rowsPerPlayer = (this.size / 2) - 1;
		let piecesPerRow = this.size / 2;

		for (let i = 0; i < rowsPerPlayer; i++) {
			for (let j = 0; j < piecesPerRow; j++) {
				let manBlack, manWhite;
				if (i % 2 === 0) {
					manBlack = this._createPiece(j * 2 + 1, i, PIECES.manBlack);
					manWhite = this._createPiece(j * 2, this.size - i - 1, PIECES.manWhite);
				} else {
					manBlack = this._createPiece(j * 2, i, PIECES.manBlack);
					manWhite = this._createPiece(j * 2 + 1, this.size - i - 1, PIECES.manWhite);
				}
				this.pieces.push(manBlack, manWhite);
			}
		}
		return this;
	}

	createEmpty2dArray() {
		return Array(this.size).fill(null).map(row => Array(this.size).fill(NO_PIECE));
	}

	create2dArray() {
		let arr = this.createEmpty2dArray();

		this.pieces.forEach(piece => {
			if (piece.alive) {
				arr[piece.y][piece.x] = piece.typeId;
			}
		})

		return arr;
	}

	ascii() {
		let divider = `  *${"-".repeat(this.size * 4 - 1)}*`;

		let board = this.createEmpty2dArray().map((row, y) => {
			return row.map((cell, x) => (x + y) % 2 === 0 ? "   |" : " . |");
		});

		this.pieces.forEach(piece => {
			board[piece.y][piece.x] = ` ${piece.toString()} |`;
		})

		return [
			`  ${Array(this.size).fill("").map((val, x) => ` ${x}  `).join('')}`,
			divider,
			...board.map((row, y) => {
				return `${y} |${row.join('')}`;
			}),
			divider
		].join('\n');
	}

	addPiece(x, y, typeId) {
		this.pieces.push(this._createPiece(x, y, typeId));
		return this;
	}

	removePiece(x, y) {
		let index = this.pieces.findIndex(piece => piece.x === x && piece.y === y);
		this.pieces.splice(index, 1);
		return this;
	}

	_capturePiece(x, y) {
		this._findPiece(x, y, true).capture();
		return this;
	}

	_revivePiece(x, y) {
		this._findPiece(x, y, false).revive();
		return this;
	}

	_increaseNoCaptureCounter() {
		this.noCaptureCounter++;
		return this;
	}

	_resetNoCaptureCounter() {
		this.noCaptureCounter = 0;
		return this;
	}

	_decreaseNoCaptureCounter() {
		if (this.noCaptureCounter > 0) {
			this.noCaptureCounter--;
		}
		return this;
	}

	_doMove(x, y, path) {
		// takes in x & y coords of piece
		// takes in path, as defined in the Moves.getValidMoves method
		const piece = { x, y };
		let moves = [];
		let captures = [];

		path.forEach(move => {
			if (move.x == null || move.y == null) {
				console.error("Can't find move x and y coordinates. Maybe you passed in all paths instead of just one?");
				return;
			}
			moves.push({ x: move.x, y: move.y });

			if (move.captured) {
				captures.push({ ...move.captured });
				this._capturePiece(move.captured.x, move.captured.y);
			}
		})

		const lastPos = moves[moves.length - 1];
		this._movePiece(x, y, lastPos.x, lastPos.y);

		this.history.push({ piece, moves, captures });

		if (captures.length > 0) {
			this._resetNoCaptureCounter();
		} else {
			this._increaseNoCaptureCounter();
		}

		return this.nextTurn();
	}

	nextTurn() {
		this.moveNumber++;
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}

	previousTurn() {
		this.moveNumber--;
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}

	_undoMove() {
		const { piece, moves, captures } = this.history.pop();
		const { x, y } = piece;

		const currentPos = moves[moves.length - 1];
		this._movePiece(currentPos.x, currentPos.y, x, y);

		captures.forEach(cap => {
			this._revivePiece(cap.x, cap.y);
		})

		if (captures.length > 0) {
			this._decreaseNoCaptureCounter();
		}

		return this.previousTurn();
	}

	_findPiece(x, y, alive = true) {
		return this.pieces.find(piece => piece.x === x && piece.y === y && piece.alive === alive);
	}

	_movePiece(x0, y0, x1, y1) {
		this._findPiece(x0, y0, true).move(x1, y1);
		return this;
	}
}