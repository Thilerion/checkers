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

		this.mustHit = false;
		this.currentPaths = [];
		this.possiblePieces = [];

		this.initializeTurn();
	}

	getPossiblePathsForPiece(x, y) {
		return this.currentPaths.filter(path => {
			return path[0].x === x && path[0].y === y;
		})
	}

	initializeTurn() {
		let hitsAndMoves = this.gameBoard.getAllHitsOrMoves(this.currentPlayer, true);
		
		for (let i = 0; i < hitsAndMoves.length; i++) {
			let move = hitsAndMoves[i];
			if (move.mustHit && this.mustHit === false) this.mustHit = true;
		}

		if (this.mustHit) {
			this.populatePathsMustHit(hitsAndMoves);
		} else {
			this.populatePathsMoves(hitsAndMoves);
		}

		this.populatePossiblePieces();

		return this;
	}

	populatePossiblePieces() {
		this.possiblePieces = [...new Set(this.currentPaths.map(path => path[0]))];
		return this;
	}

	populatePathsMustHit(hits) {
		let paths = [];

		hits.forEach(piece => {
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

	populatePathsMoves(moves) {
		let paths = [];

		moves.forEach(piece => {
			let reducedMoves = piece.moves.map(move => {
				return { x: move.x, y: move.y };
			})
			reducedMoves.forEach(move => {
				let curMove = [
					piece.piece,
					move
				];			
				paths.push(curMove);
			})
		})
		this.currentPaths = paths;
		return this;
	}

	finishTurn() {
		this.mustHit = false;
		this.currentPaths = [];
		this.possiblePieces = [];
		return this.nextPlayer().initializeTurn();
	}

	nextPlayer() {
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

		return this;
	}

	isMoveValidPath(x0, y0, x1, y1) {
		return this.currentPaths.find(path => {
			let validStartPiece = path[0].x === x0 && path[0].y === y0;
			let validMovement = path[1].x === x1 && path[1].y === y1;
			return validStartPiece && validMovement;
		})
	}

	move(x0, y0, x1, y1) {
		//TODO: check if move or hit in currentPath
		if (!this.isMoveValidPath(x0, y0, x1, y1)) {
			console.warn(`Can't move ${x0},${y0} to ${x1},${y1} as it is not a valid path.`);
			return this;
		}
		
		this.gameBoard.makeMove(x0, y0, x1, y1);
		return this.finishTurn();
	}

	hit(x0, y0, x1, y1) {
		//TODO: check if move or hit in currentPath
		if (!this.isMoveValidPath(x0, y0, x1, y1)) {
			console.warn(`Can't move ${x0},${y0} to ${x1},${y1} as it is not a valid path.`);
			return this;
		}

		this.gameBoard.makeMove(x0, y0, x1, y1);

		this.currentPaths = this.currentPaths.filter(path => {
			return path[0].x === x0 && path[0].y === y0 && path[1].x === x1 && path[1].y === y1;
		}).map(path => {
			return path.slice(1);
		})
		
		// TODO: maybe check every path for their length? shouldn't be necessary because all paths should have been only the largest
		if (this.currentPaths.length <= 0 || this.currentPaths[0].length <= 1) {
			this.deselect();
			return this.finishTurn();
		} else {
			console.warn("This was not the last hit in the path, another capture is required.");
			this.populatePossiblePieces();

			if (this.checkerBoard.selected.x === x0 && this.checkerBoard.selected.y === y0) {
				this.select(x1, y1);
			} else {
				console.warn("Won't select next square because the currently moving piece was not selected either.");
			}
			return this;
		}
	}

	canPieceMove(x, y) {
		return !!this.possiblePieces.find(piece => piece.x === x && piece.y === y);
	}

	select(x, y) {
		// called by selecting someting
		// also called onHit, to select where the piece has moved to
		// call checkerBoard.select
		// call this updateSquarePossibleMovesAndHits
		if (this.canPieceMove(x, y)) {
			this.checkerBoard.selectSquare(x, y);
			return this.updateSquaresPossibleMovesAndHits();
		} else if (this.checkerBoard.selected) {			
			let selX = this.checkerBoard.selected.x;
			let selY = this.checkerBoard.selected.y;
			let path = this.isMoveValidPath(selX, selY, x, y);
			if (!!path) {
				if (Math.abs(path[0].x + path[1].x) / 2 > 1) {
					this.hit(selX, selY, x, y);
				} else {
					this.move(selX, selY, x, y);
				}
			}
			return this;
		}
	}

	deselect() {
		// called by finishTurn and after each hit with more hits to come
		// calls checkerBoard.deselect
		this.checkerBoard.deselectSquare();
		return this;
	}

	updateSquaresPossibleMovesAndHits() {
		// called on select
		let selected = this.checkerBoard.selected;
		if (!selected) return this;
		let paths = [...this.currentPaths].filter(path => {
			return path[0].x === selected.x && path[0].y === selected.y;
		});

		let { primMoves, nextMoves, possibleHits } = paths.reduce((acc, path) => {
			for (let i = 1; i < path.length; i++) {
				if (i === 1) acc.primMoves.push({ ...path[i] });
				else {
					acc.nextMoves.push({ ...path[i] });
				}

				let dx = Math.abs(path[i - 1].x - path[i].x);
				let dy = Math.abs(path[i - 1].y - path[i].y);
				if (dx > 1 && dy > 1) {
					acc.possibleHits.push({x: (path[i - 1].x + path[i].x) / 2, y: (path[i - 1].y + path[i].y) / 2})
				}
			}
			return acc;
		}, { primMoves: [], nextMoves: [], possibleHits: [] });

		this.checkerBoard.updatePossibleMovesHits(primMoves, nextMoves, possibleHits);

		return this;
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

	selectSquare(x, y) {
		if (this.selected !== null) {
			if (this.selected.x === x && this.selected.y === y) {
				this.deselectSquare();
				return this;
			} else {
				this.deselectSquare();
			}
		}
		this.selected = { x, y };
		this.grid[y][x].selected = true;
		return this;
	}

	deselectSquare() {
		if (this.selected === null) return;

		const { x, y } = this.selected;
		this.selected = null;
		this.grid[y][x].selected = false;
		return this.updatePossibleMovesHits();
	}

	updatePossibleMovesHits(primMoves = [], nextMoves = [], hits = []) {
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				this.grid[j][i].isPossiblePrimaryMove = false;		
				this.grid[j][i].isPossibleNextMove = false;		
				this.grid[j][i].isPossibleHit = false;		
			}
		}

		primMoves.forEach(square => {
			this.grid[square.y][square.x].isPossiblePrimaryMove = true;
		})
		nextMoves.forEach(square => {
			this.grid[square.y][square.x].isPossibleNextMove = true;
		})
		hits.forEach(square => {
			this.grid[square.y][square.x].isPossibleHit = true;
		})
		return this;
	}
}

class Square {
	constructor(x, y, color) {
		this.squareColor = color;
		this.x = x;
		this.y = y;

		this.selected = false;
		this.isPossiblePrimaryMove = false;
		this.isPossibleNextMove = false;
		this.isPossibleHit = false;
	}
}

export { Checkers, Board, Grid, Square, Piece };