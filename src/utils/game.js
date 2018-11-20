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

		this.piecesWithAvailableMoves = [];
		this.mustHit = false;
		this.currentPaths = [];
		this.mustFinishPathWith = { x: null, y: null };

		this.initializeTurn();
	}

	initializeTurn() {
		this.piecesWithAvailableMoves = this.gameBoard.getAllHitsOrMoves(this.currentPlayer, true);
		
		for (let i = 0; i < this.piecesWithAvailableMoves.length; i++) {
			let move = this.piecesWithAvailableMoves[i];
			if (move.mustHit && this.mustHit === false) this.mustHit = true;
		}

		if (this.mustHit) this.populatePaths();

		return this;
	}

	populatePaths() {
		let paths = [];

		this.piecesWithAvailableMoves.forEach(piece => {
			piece.moves.forEach(initialMove => {
				initialMove.paths.forEach(path => {
					let reducedPath = path.map(p => {
						return { x: p.x, y: p.y };
					});
					let curPath = [
						piece.piece,
						...reducedPath
					];
					paths.push(curPath);
				})
			})
		})
		this.currentPaths = paths;
		return this;
	}

	finishTurn() {
		this.piecesWithAvailableMoves = [];
		this.mustHit = false;
		this.currentPaths = [];
		this.mustFinishPathWith = {x: null, y: null};
		return this.nextPlayer().initializeTurn();
	}

	nextPlayer() {
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

		return this;
	}

	move(x0, y0, x1, y1) {
		this.gameBoard.makeMove(x0, y0, x1, y1);
		this.finishTurn();
	}

	hit(x0, y0, x1, y1) {
		this.gameBoard.makeMove(x0, y0, x1, y1);

		this.currentPaths = this.currentPaths.filter(path => {
			return path[0].x === x0 && path[0].y === y0 && path[1].x === x1 && path[1].y === y1;
		}).map(path => {
			return path.slice(1);
		})
		
		// TODO: maybe check every path for their length? shouldn't be necessary because all paths should have been only the largest
		if (this.currentPaths.length <= 0 || this.currentPaths[0].length <= 1) {
			this.finishTurn();
		} else {
			this.mustFinishPathWith = { x: x1, y: y1 };
		}
	}

	canPieceMove(x, y) {
		let piece = this.gameBoard.getPieceAt(x, y);
		if (!piece) {
			console.warn(`No piece was found at ${x},${y} so it can't be moved.`);
			return false;
		}
		if (this.gameBoard.getPiecePlayer(this.gameBoard.getPieceAt(x, y)) !== this.currentPlayer) {
			// piece doesn't belong to current player
			console.warn(`Can't move piece at ${x},${y} if it is the enemy's piece.`);
			return false;
		}
		if (this.mustFinishPathWith.x !== null) {
			if (this.mustFinishPathWith.x !== x || this.mustFinishPathWith.y !== y) {
				console.warn(`Piece at ${x},${y} can't be moved, as only a move in the current path is allowed`);
				return false;
			} else {
				// Yes, allowed, since this is the only piece that can be moved as this path has been chosen
				return true;
			}
		}
		return !!this.piecesWithAvailableMoves.find(p => p.piece.x === x && p.piece.y === y);
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
		return this;
	}

	getPieceAt(x, y) {
		return this.board[y][x];
	}

	getPiecePlayer(piece) {
		if (piece < 0) return PLAYER_BLACK;
		else if (piece > 0) return PLAYER_WHITE;
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
			if (!getSquare && dir.forward) {
				newDir = { x: x1, y: y1, hit: false };
				acc.push(newDir);
			}
			return acc;
		}, []);
	}

	getPossibleHits(x, y) {
		let myPiece = this.getPieceAt(x, y);

		return this.getValidDirections(x, y).reduce((acc, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let squareToCapture = this.getPieceAt(x1, y1);

			if (squareToCapture && this.getPiecePlayer(myPiece) !== this.getPiecePlayer(squareToCapture)) {
				let x2 = dir.dx + x1;
				let y2 = dir.dy + y1;

				if (this.isValidSquare(x2, y2) && !this.getPieceAt(x2, y2)) {
					let newDir = { x0: x, y0: y, x1: x2, y1: y2, captured: { x: x1, y: y1 } };
					acc.push(newDir);
				}
			}
			return acc;
		}, [])
	}

	getAllHitsOrMoves(player, mustHitIfPossible = true) {
		let mustHit = false;
		let pieces = [];

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				let piece = this.board[y][x];
				if (this.getPiecePlayer(piece) === player) {
					let moves = this.getHitsOrMovesForPiece(x, y, true);
					if (moves.length > 0) {
						if (moves[0].hit) mustHit = true;
						pieces.push({
							piece: {
								x, y
							},
							moves,
							mustHit: moves[0].hit
						});
					}
					
				}
			}
		}
		
		if (mustHitIfPossible && mustHit) {
			return pieces.filter(p => {
				return p.mustHit;
			});
		}

		return pieces;
	}

	getHitsOrMovesForPiece(x, y, onlyLongest = true) {
		let hits = this.getPossibleHits(x, y);

		if (hits.length < 1) {
			let moves = this.getPossibleMoves(x, y);
			return moves;
		}

		let board = Board.copy(this);

		let longestPath = 1;

		let sequences = hits.map(hit => {
			board.makeMove(hit.x0, hit.y0, hit.x1, hit.y1);

			let curSeqs = JSON.parse(JSON.stringify(board.recursiveHitSequences(hit.x1, hit.y1)));

			board.undoMove();
			
			// console.log({ firstMove: {x: hit.x1, y: hit.y1}, curSeqs });
			for (let i = 0; i < curSeqs.length; i++) {
				longestPath = Math.max(longestPath, curSeqs[i].length);
			}

			return { x: hit.x1, y: hit.y1, paths: curSeqs, hit: true };
		})

		// console.log("Returning all sequences at the start: ", sequences);

		if (onlyLongest) {
			// finds all paths that are the longest, discards the rest
			// then finds all initial moves with a path that is among the longest
			return sequences.reduce((acc, seq) => {
				let newPaths = seq.paths.filter(path => {
					return path.length >= longestPath;
				})
				if (newPaths.length < 1) return acc;
				else {
					acc.push({ ...seq, paths: newPaths });
					return acc;
				}
			}, [])
		}

		return sequences;
	}

	recursiveHitSequences(x, y) {
		let hits = this.getPossibleHits(x, y);

		if (hits.length < 1) {
			// return next positions after hits in history
			let movements = this.history.reduce((moves, move) => {
				if (move.capture) {
					moves.push(JSON.parse(JSON.stringify({x: move.x1, y: move.y1})))
				}
				return moves;
			}, []);
			// console.log("Returning captures at end of chain: ", captures);
			return [movements];
		}

		let sequences = [];
		for (let i = 0; i < hits.length; i++) {
			let hit = hits[i];
			this.makeMove(hit.x0, hit.y0, hit.x1, hit.y1);

			let sequence = JSON.parse(JSON.stringify(this.recursiveHitSequences(hit.x1, hit.y1)));

			sequences.push(...sequence);

			this.undoMove();
		}

		// console.log("Returning sequences in middle of chain: ", sequences);
		return sequences;
	}

	makeMove(x0, y0, x1, y1) {
		let dx = x1 - x0;
		let dy = y1 - y0;

		let move = { x0, x1, y0, y1, capture: null };

		if (Math.abs(dx) > 1 && Math.abs(dy) > 1) {
			move.capture = { x: x0 + (dx / 2), y: y0 + (dy / 2), type: null};
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