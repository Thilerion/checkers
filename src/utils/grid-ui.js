import { SQUARE_TYPES, PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, NO_PIECE } from './constants.js';

class Grid {
	constructor(size) {
		this.size = size;
		this.grid = this.createEmpty(this.size);

		this.pieces = [];
		this.selected = null;
	}

	createEmpty(size) {
		let arr = [];
		
		for (let i = 0; i < size; i++) {
			let row = [];
			for (let j = 0; j < size; j++) {
				if ((i + j) % 2 === 0) row.push(new Square(j, i, SQUARE_TYPES.white));
				else row.push(new Square(j, i, SQUARE_TYPES.black));
			}
			arr.push(row);
		}
		return arr;
	}
	
	findPiece(x, y) {
		return this.grid[y][x].piece;
	}

	createPieces(board) {
		for (let y = 0; y < board.length; y++) {
			for (let x = 0; x < board[y].length; x++) {
				let pieceId = board[y][x];
				if (pieceId !== NO_PIECE) {
					let playerId = pieceId < 0 ? PLAYER_BLACK : PLAYER_WHITE;
					let type = Math.abs(pieceId);
					this.grid[y][x].addPiece(new Piece(playerId, type));
				} else {
					this.grid[y][x].piece = null;
				}
			}
		}
		return this;
	}

	movePiece(x0, y0, x1, y1) {
		const piece = this.grid[y0][x0].piece;
		this.grid[y0][x0].piece = null;
		this.grid[y1][x1].piece = piece;
	}

	capturePiece({ x, y }) {
		this.findPiece(x, y).capture();
	}

	crownPiece(x, y) {
		this.findPiece(x, y).crown();
	}
}

class Piece {
	constructor(playerId, type) {
		this.type = type;
		this.playerId = playerId;
		this.alive = true;
	}

	capture() {
		this.alive = false;
	}

	isKing() {
		return this.type === PIECE_KING;
	}

	crown() {
		if (!this.isKing()) {
			this.type = PIECE_KING;
		}
	}
}

class Square {
	constructor(x, y, color) {
		this.squareColor = color;
		this.x = x;
		this.y = y;

		this.piece = null;
	}

	addPiece(piece) {
		this.piece = piece;
	}
}

export { Grid, Square, Piece };