import { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, NO_PIECE, PIECES, SQUARE_TYPES } from './constants.js';
import { coordsToIndex, indexToCoords } from './util-fns.js';

const DIRECTIONS = [
	{ dx: 1, dy: -1 },
	{ dx: 1, dy: 1 },
	{ dx: -1, dy: 1 },
	{ dx: -1, dy: -1 }
];

class Checkers {
	constructor(options = RULES) {
		const { size, firstMove, captureBack, flyingKings } = options;
		this.size = size;
		this.firstMove = firstMove;
		this.captureBack = captureBack;
		this.flyingKings = flyingKings;

		this.checkerBoard = new Grid(this.size);
		this.gameBoard = new Board(this.size).createBoard().addInitialPieces();

		this.currentPlayer = this.firstMove;
	}
}

class Board {
	constructor(size) {
		this.size = size;
		this.board = [];

		this.history = [];
	}

	static copy(oldBoard) {
		let newBoard = new Board(oldBoard.size);
		newBoard.board = JSON.parse(JSON.stringify(oldBoard.board));
		return newBoard;
	}

	createBoard() {
		this.board = Array(this.size).fill(null).map(row => Array(this.size).fill(0));
		return this;
	}

	addInitialPieces() {
		let rowsPerPlayer = (this.size / 2) - 1;
		let piecesPerRow = this.size / 2;

		for (let i = 0; i < rowsPerPlayer; i++) {
			for (let j = 0; j < piecesPerRow; j++) {
				if (i % 2 === 0) {
					this.board[i].splice(j * 2 + 1, 1, PIECES.manBlack);
					this.board[this.size - i - 1].splice(j * 2, 1, PIECES.manWhite);
				} else {
					this.board[i].splice(j * 2, 1, PIECES.manBlack);
					this.board[this.size - i - 1].splice(j * 2 + 1, 1, PIECES.manWhite);
				}
			}
		}
		return this;
	}

	removePiece(x, y) {
		let piece = this.getPieceAt(x, y);
		this.board[y].splice(x, 1, NO_PIECE);
		return piece;
	}

	setPiece(x, y, piece) {
		this.board[y].splice(x, 1, piece);
	}

	getPieceAt(x, y) {
		return this.board[y][x];
	}

	isValidSquare(x, y) {
		return (x >= 0 && x < this.size) && (y >= 0 && y < this.size) && ((x + y) % 2 === 1);
	}

	//	only checks if a square exists in that direction, if it is a black square,
	//		and adds if it is forward or not
	getValidDirections(x, y) {
		return DIRECTIONS.filter(dir => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			return this.isValidSquare(x1, y1);
		}).map(dir => {
			let type = this.getPieceAt(x, y);
			let forward = true;
			if (type === PIECES.manWhite && dir.dy > 0) forward = false;
			else if (type === PIECES.manBlack && dir.dy < 0) forward = false;

			return { ...dir, forward };
		})
	}

	getPossibleMoves(x, y) {
		return this.getValidDirections(x, y).reduce((acc, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let getSquare = this.getPieceAt(x1, y1);

			let newDir = {};
			if (!getSquare) {
				newDir = { ...dir, x0: x, y0: y, x1, y1 };
				acc.push(newDir);
			}
			return acc;
		}, []);
	}

	makeMove(x0, y0, x1, y1) {
		let dx = x1 - x0;
		let dy = y1 - y0;

		let move = { x0, x1, y0, y1, capture: null };

		if (Math.abs(dx) > 1 && Math.abs(dy) > 1) {
			move.capture = { x: x0 + dx, y: y0 + dx, type: null};
			move.capture.type = this.getPieceAt(move.capture.x, move.capture.y);
			this.removePiece(move.capture.x, move.capture.y);
		}

		let movedPiece = this.removePiece(x0, y0);
		this.setPiece(x1, y1, movedPiece);

		this.history.push(move);
		return this;
	}

	undoMove() {
		let move = this.history.pop();

		let movedPiece = this.removePiece(move.x1, move.y1);
		this.setPiece(move.x0, move.x1, movedPiece);

		if (!!move.capture) {
			this.setPiece(move.capture.x, move.capture.y, move.capture.type);
		}

		return this;
	}
}

class Grid {
	constructor(size) {
		this.size = size;
		this.grid = this.createEmpty(this.size);
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
}

class GridOLD {
	import(str) {
		// w and W for white man and king
		// b and B for black man and king
		// NO_PIECE === 0 === empty
		// - is next row
		this.pieces = [];

		let rows = str.split('-');

		for (let y = 0; y < rows.length; y++) {
			let row = rows[y];
			for (let i = 0, x = 1 - (y % 2); i < row.length && x < this.size; i++ , x += 2) {
				if (row[i] == NO_PIECE) {
					// double equals for the string > int typecasting
					continue;
				}

				let p = row[i].toLowerCase() === 'w' ? PLAYER_WHITE : PLAYER_BLACK;
				let type = row[i].toLowerCase() === row[i] ? PIECE_MAN : PIECE_KING;
				this.pieces.push(new Piece(p, x, y, type));
			}
		}
		return this;
	}

	export() {
		let pieces = [];

		for (let i = 0; i < this.pieces.length; i++) {
			let p = this.pieces[i];

			let x = p.x % 2 === 0 ? p.x / 2 : (p.x - 1) / 2;
			let y = Math.floor(p.y % this.size);

			let char = p.playerId === PLAYER_WHITE ? 'w' : 'b';
			
			let typeChar = p.type === PIECE_MAN ? char : char.toUpperCase();

			pieces.push({ ch: typeChar, x, y });
		}

		pieces.sort((a, b) => {
			let indexA = (a.y * this.size) + a.x;
			let indexB = (b.y * this.size) + b.x;
			return indexA < indexB;
		});

		let arr = [];
		for (let i = 0; i < pieces.length; i++) {
			let p = pieces[i];

			if (!arr[p.y]) arr[p.y] = Array(this.size / 2).fill(0);
			arr[p.y][p.x] = p.ch;
		}
		
		return arr.map(row => row.join('')).join('-');
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

	isValidSquare(x, y) {
		return (x >= 0 && x < this.size) && (y >= 0 && y < this.size) && this.grid[y][x].squareColor === SQUARE_TYPES.black;
	}

	getPieceAt(x, y) {
		return this.pieces.find(p => p.x === x && p.y === y && p.alive);
	}

	getValidDirsFor(piece) {
		if (!piece) return [];
		return piece.getDirections().filter(dir => this.isValidSquare(dir.x, dir.y));
	}

	getValidMovesFor(x, y) {
		let piece = this.getPieceAt(x, y);
		let dirs = this.getValidDirsFor(piece);

		// check if piece on dir
		// 		yes: enemy piece? check for hit, else nothing
		//		no: possible move
		let moves = [], hits = [];

		for (let i = 0; i < dirs.length; i++) {
			let dir = dirs[i];

			let movePiece = this.getPieceAt(dir.x, dir.y);

			if (!movePiece && dir.forward) {
				// empty square, and the direction is forward, so possible move
				moves.push({x: dir.x, y: dir.y});
			} else if (movePiece && movePiece.playerId !== piece.playerId) {
				// square has an opponent's piece, so maybe a hit direction
				let hit = this.isHit(piece, dir);
				if (hit) {
					// TODO: check hits recursive
					hits.push(hit);
				}
			}
		}

		let tree = { x: piece.x, y: piece.y, next: [] };
		if (hits.length > 0) {
			for (let i = 0; i < hits.length; i++) {
				let newNode = this.findLongestHitChain(piece, hits[i]);
				tree.next.push(newNode);
			}
		}

		console.log(tree);

		return {moves, hits};
	}

	isHit(piece, dir) {
		let hitDir = {
			x: dir.x + dir.dx,
			y: dir.y + dir.dy,
			captured: [{x: dir.x, y: dir.y}]
		};

		let adjacentPiece = this.getPieceAt(hitDir.x, hitDir.y);
		if (!adjacentPiece) {
			return hitDir;
		}
		return;
	}

	findLongestHitChain(piece, hit) {
		console.log(hit);
		let node = { ...hit, next: [] };

		let { captured = [] } = hit;

		const startX = piece.x;
		const startY = piece.y;
		const curX = hit.x;
		const curY = hit.y;

		//console.log(hit, { startX, startY, curX, curY });
		
		for (let i = 0; i < DIRECTIONS.length; i++) {
			let dir = DIRECTIONS[i];

			let nextCoords = { x: curX + dir.dx, y: curY + dir.dy };
			let nextSquare = this.getPieceAt(nextCoords.x, nextCoords.y);

			if (!this.isValidSquare(nextCoords.x, nextCoords.y)) {
				continue;
			}

			let nextPieceAlreadyCaptured = false;
			if (nextSquare) {
				nextPieceAlreadyCaptured = !!hit.captured.find(cap => cap.x === nextCoords.x && cap.y === nextCoords.y);
			}

			let adjacentCoords = { x: nextCoords.x + dir.dx, y: nextCoords.y + dir.dy };
			let adjacentPiece = this.getPieceAt(adjacentCoords.x, adjacentCoords.y);

			if (!this.isValidSquare(adjacentCoords.x, adjacentCoords.y)) {
				continue;
			}

			if (nextSquare &&
				(nextSquare.playerId !== piece.playerId) &&
				!nextPieceAlreadyCaptured &&
				(!adjacentPiece || (adjacentCoords.x === startX && adjacentCoords.y === startY))) {
				// if next square has a piece, that piece is from the opponent,
				// 	that piece has not yet been captured, and the adjacent piece is free or is the original evaluated piece position
				node.next.push({ ...adjacentCoords, captured: [nextCoords, ...captured] });
			}
		}

		for (let i = 0; i < node.next.length; i++) {
			node.next[i] = this.findLongestHitChain(piece, node.next[i]);
		}

		return node;
	}
}

class Piece {
	constructor(player, x, y, type = PIECE_MAN) {
		this.playerId = player;
		this.x = x;
		this.y = y;
		this.type = type;

		if (player === PLAYER_BLACK) {
			this.pieceId = type === PIECE_MAN ? PIECES.manBlack : PIECES.kingBlack;
		} else if (player === PLAYER_WHITE) {
			this.pieceId = type === PIECE_MAN ? PIECES.manWhite : PIECES.kingWhite;
		}

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

	getDirections() {
		return DIRECTIONS.map(dir => {
			let forward;
			if (this.playerId === PLAYER_WHITE) {
				forward = dir.dy < 0;
			} else if (this.playerId === PLAYER_BLACK) {
				forward = dir.dy > 0;
			}
			return { ...dir, x: dir.dx + this.x, y: dir.dy + this.y, forward };
		});
	}
}

class Square {
	constructor(x, y, color) {
		this.squareColor = color;
		this.x = x;
		this.y = y;
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