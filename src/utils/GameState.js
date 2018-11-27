import { NO_PIECE, PIECES } from './constants.js';

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
		return { x, y, type };
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
}