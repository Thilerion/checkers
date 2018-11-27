import { NO_PIECE, PIECES, PLAYER_BLACK, PLAYER_WHITE } from './constants.js';

export default class GameState {
	constructor(options) {
		const { size, currentPlayer } = options;

		this.size = size;
		this.pieces = [];
		this.history = [];

		this.currentPlayer = currentPlayer;
		this.moveNumber = 0;	
		this.drawCounters = {
			oneKingTwoPieces: null,
			oneKingThreePieces: null,
			noCapturesOnlyKingsMoved: null
		}
	}

	_createPiece(x, y, type) {
		return { x, y, type, alive: true };
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

	create2dArray() {
		let arr = Array(this.size).fill(null).map(row => Array(this.size).fill(NO_PIECE));

		this.pieces.forEach(piece => {
			arr[piece.y][piece.x] = piece.type;
		})

		return arr;
	}

	ascii() {
		let str = "   ";
		let board = this.create2dArray();
		let divider = "-".repeat(this.size * 4 - 1);
		
		for (let i = 0; i < this.size; i++) {
			str += ` ${i}  `;
		}
		str += `\n  *${divider}*\n`;
		for (let y = 0; y < this.size; y++) {
			str += `${y} |`;
			for (let x = 0; x < this.size; x++) {
				if (board[y][x] === PIECES.manBlack) str += " b |";
				else if (board[y][x] === PIECES.manWhite) str += " w |";
				else if (board[y][x] === PIECES.kingBlack) str += " B |";
				else if (board[y][x] === PIECES.kingWhite) str += " W |";
				else {
					if ((y + x) % 2 === 0) str += "   |";
					else str += " . |";
				}
			}
			str += "\n";
		}
		str += `  *${divider}*\n`;
		return str;
	}

	addPiece(x, y, type) {
		this.pieces.push(this._createPiece(x, y, type));
		return this;
	}

	removePiece(x, y) {
		let index = this.pieces.findIndex(piece => piece.x === x && piece.y === y);
		this.pieces.splice(index, 1);
		return this;
	}

	_capturePiece(x, y) {
		this._findPiece(x, y).alive = false;
		return this;
	}

	_revivePiece(x, y) {
		this._findPiece(x, y).alive = true;
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

		return this.previousTurn();
	}

	_findPiece(x, y) {
		return this.pieces.find(piece => piece.x === x && piece.y === y);
	}

	_movePiece(x0, y0, x1, y1) {
		let piece = this._findPiece(x0, y0);
		piece.x = x1;
		piece.y = y1;
		return this;
	}
}