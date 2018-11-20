import { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, EMPTY_CELL, PIECES, SQUARE_TYPES } from './constants.js';
import { coordsToIndex, indexToCoords } from './util-fns.js';

class Checkers {
	constructor(options = RULES) {
		const { size, firstMove, captureBack, flyingKings } = options;
		this.size = size;
		this.firstMove = firstMove;
		this.captureBack = captureBack;
		this.flyingKings = flyingKings;

		this.board = new Checkerboard(this.size);

		this.currentPlayer = this.firstMove;
	}
}

class Checkerboard {
	constructor(size) {
		this.size = size;
		this.grid = this.createEmpty(this.size);
		this.pieces = this.addPieces();
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

	addPieces() {
		let rowsPerPlayer = (this.size / 2) - 1;
		let piecesPerRow = this.size / 2;

		let arr = [];

		for (let i = 0; i < rowsPerPlayer; i++) {
			for (let j = 0; j < piecesPerRow; j++) {
				let pB, pW;
				if (i % 2 === 0) {
					pB = new Piece(PLAYER_BLACK, j * 2 + 1, i, PIECE_MAN);
					pW = new Piece(PLAYER_WHITE, j * 2, this.size - i - 1, PIECE_MAN);
				} else {
					pB = new Piece(PLAYER_BLACK, j * 2, i, PIECE_MAN);
					pW = new Piece(PLAYER_WHITE, j * 2 + 1, this.size - i - 1, PIECE_MAN);
				}
				arr.push(pB, pW);
			}
		}
		return arr;
	}
}

class Square {
	constructor(x, y, color) {
		this.squareColor = color;
		this.x = x;
		this.y = y;
	}
}

class Piece {
	constructor(player, x, y, type = PIECE_MAN) {
		this.playerId = player;
		this.x = x;
		this.y = y;
		this.type = type;

		this.alive = true;
	}

	hitPiece() {
		this.alive = false;
		return this;
	}

	crownPiece() {
		this.type = PIECE_KING;
		return this;
	}

	isKing() {
		return this.type === PIECE_KING;
	}
}

/*class Board {
	constructor(size, grid) {
		this.size = size;
		this.grid = grid;
	}

	static empty(size) {
		return new Board(size, this.createEmptyGrid(size));
	}
	
	static createEmptyGrid(size) {
		return Array(size * size).fill(EMPTY_CELL);
	}

	coordsToIndex(x, y) {
		return coordsToIndex(x, y, this.size);
	}

	indexToCoords(index) {
		return indexToCoords(index, this.size);
	}

	getCellType(x, y) {
		if ((x + y) % 2 === 0) return CELL_TYPES.white;
		return CELL_TYPES.black;
	}

	initialFill() {
		let arr = this.grid;
		let rowsPerPlayer = (this.size / 2) - 1;

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (i < rowsPerPlayer) {
					//blacks
					if ((j + i) % 2 !== 0) {
						arr[coordsToIndex(j, i, this.size)] = PIECES.manBlack;
					}
				} else if (i > this.size - rowsPerPlayer - 1) {
					//whites
					if ((j + i) % 2 !== 0) {
						arr[coordsToIndex(j, i, this.size)] = PIECES.manWhite;
					}
				}
			}
		}
		this.grid = [...arr];
		return this;
	}

	getPieceAt(x, y) {
		return this.grid[this.coordsToIndex(x, y)];
	}

	isValidCell(x, y) {
		return (x >= 0 && x < this.size) && (x >= 0 && y < this.size);
	}
}

class Pos {
	constructor() {
		this.x = null;
		this.y = null;
		this.index = null;
		this.boardSize = null;
	}

	setIndex(index, boardSize) {
		this.index = index;
		this.boardSize = boardSize;
		
		const { x, y } = indexToCoords(index, boardSize);
		this.x = x;
		this.y = y;
		return this;
	}

	getIndex() {
		if (!this.index) {
			this.index = coordsToIndex(this.x, this.y, this.size);
		}
		return this.index;
	}

	setCoords(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.index = coordsToIndex(x, y, size);
		return this;
	}

	getCoords() {
		if (this.x == null || this.y == null) {
			const { x, y } = indexToCoords(index, boardSize);
			this.x = x;
			this.y = y;
		}
		return { x: this.x, y: this.y };
	}
}*/

// let g = new Game({ size: 8 });

export { Checkers, Checkerboard, Square, Piece };