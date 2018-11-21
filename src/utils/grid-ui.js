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
		return this.pieces.find(piece => piece.x === x && piece.y === y);
	}

	createPieces(board) {
		console.log(JSON.parse(JSON.stringify(board)));
		for (let y = 0; y < board.length; y++) {
			for (let x = 0; x < board[y].length; x++) {
				let pieceId = board[y][x];
				if (pieceId !== NO_PIECE) {
					let playerId = pieceId < 0 ? PLAYER_BLACK : PLAYER_WHITE;
					let type = Math.abs(pieceId);
					this.pieces.push(new Piece(x, y, playerId, type));
				}
			}
		}
		return this;
	}

	movePiece(x0, y0, x1, y1) {
		this.findPiece(x0, y0).move(x1, y1);
	}

	capturePiece({ x, y }) {
		this.findPiece(x, y).capture();
	}
}

class Piece {
	constructor(x, y, playerId, type) {
		this.type = type;
		this.playerId = playerId;
		this.alive = true;
		this.x = x;
		this.y = y;
	}

	move(x, y) {
		this.x = x;
		this.y = y;
	}

	capture() {
		this.alive = false;
	}

	isKing() {
		return this.type === PIECE_KING;
	}
}

class Square {
	constructor(x, y, color) {
		this.squareColor = color;
		this.x = x;
		this.y = y;
	}
}

export { Grid, Square, Piece };