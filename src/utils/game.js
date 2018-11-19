import { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, EMPTY_CELL, PIECES } from './constants.js';
import { coordsToIndex, indexToCoords } from './util-fns.js';

class Checkers {
	constructor(options = RULES) {
		const { size, firstMove, captureBack, flyingKings } = options;
		this.size = size;
		this.firstMove = firstMove;
		this.captureBack = captureBack;
		this.flyingKings = flyingKings;

		this.board = Board.empty(size).initialFill();

		this.currentPlayer = this.firstMove;
	}
}

class Board {
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

	initialFill() {
		let arr = this.grid;
		let rowsPerPlayer = (this.size / 2) - 2;

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

// let g = new Game({ size: 8 });

export { Checkers, Board };