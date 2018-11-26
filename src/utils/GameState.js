import { PLAYER_BLACK, PLAYER_WHITE, NO_PIECE, PIECES } from './constants.js';

class GameState {
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

export default GameState;