import { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, NO_PIECE, PIECES, SQUARE_TYPES } from './constants.js';

import { Grid } from './grid-ui.js';

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

		this.gameBoard = new Board(this.size).createBoard().addInitialPieces();
		this.checkerBoard = new Grid(this.size).createPieces(this.gameBoard.board);

		this.currentPlayer = this.firstMove;
		this.selected = null;
		this.currentPaths = [];
		this.piecesLeft = {};

		this.gameEnd = false;
		this.winner = null;

		this.initializeTurn();
	}

	initializeTurn() {
		let turnOptions = this.gameBoard.getAllPieceOptions(this.currentPlayer);

		let filteredMoves = this.gameBoard.filterMovesIfMustHit(turnOptions);
		let filteredLengths = this.gameBoard.filterSmallPaths(filteredMoves);

		this.currentPaths = filteredLengths;
		return this;
	}

	checkGameEnd() {
		if (this.gameBoard.piecesLeft[PLAYER_BLACK] === 0) {
			// white has won
			this.gameEnd = true;
			this.winner = PLAYER_WHITE;
		} else if (this.gameBoard.piecesLeft[PLAYER_WHITE] === 0) {
			// black has won
			this.gameEnd = true;
			this.winner = PLAYER_BLACK;
		} else {
			return this;
		}
	}

	finishTurn() {
		this.currentPaths = [];
		this.selected = null;
		this.checkGameEnd();

		if (!this.gameEnd) {
			return this.nextPlayer().initializeTurn();
		}
	}

	nextPlayer() {
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}

	getPathsForPiece(x, y) {
		let piecePaths = this.currentPaths.find(piecePath => piecePath.piece.x === x && piecePath.piece.y === y);
		if (!piecePaths) return;
		else return piecePaths.paths;
	}

	getNextMovesForPiece(x, y) {
		let paths = this.getPathsForPiece(x, y);
		if (!paths) return;

		return paths.map(path => path[0]);
	}

	isValidMove(x0, y0, x1, y1) {
		let nextMoves = this.getNextMovesForPiece(x0, y0);
		if (!nextMoves) return false;

		return !!nextMoves.find(move => move.x === x1 && move.y === y1);
	}

	isPieceSelectable(x, y) {
		return !!this.getPathsForPiece(x, y);
	}

	isHit(x0, y0, x1, y1) {
		return Math.abs(x0 - x1) > 1 && Math.abs(y0 - y1) > 1;
	}

	shortenCurrentPaths(x0, y0, x1, y1) {
		const piece = { x: x1, y: y1 };
		// First filter to get only paths that start with the move currently being made
		// Then remove that move from the path, shortening it by 1
		const paths = this.getPathsForPiece(x0, y0).filter(path => {
			return path[0].x === x1 && path[0].y === y1;
		}).map(path => path.slice(1));

		if (paths[0].length < 1) {
			console.log("No more options are left for this move, as the paths array is empty.");
			this.currentPaths = [];
			return this;
		}

		console.log({ newPaths: paths });
		this.currentPaths = [
			{
				piece,
				paths
			}
		];
		return this;
	}

	move(x0, y0, x1, y1) {
		if (!this.isValidMove(x0, y0, x1, y1)) {
			console.warn(`Can't move piece ${x0},${y0} to ${x1},${y1} as it is an invalid move.`);
			return this;
		}

		this.gameBoard.makeMove(x0, y0, x1, y1);
		this.updateSelection(x1, y1);

		const isHit = this.isHit(x0, y0, x1, y1);
		this.updateGrid(x0, y0, x1, y1, isHit);

		// if hit, shorten paths, check if more hits possible
		if (isHit) {
			console.log("Move is a hit, now modifying the currentPaths array to check if more hits are possible");
			
			this.shortenCurrentPaths(x0, y0, x1, y1);
			if (this.currentPaths.length > 0) {
				console.log("There are other hits that must be made.");
				return this;
			}
			console.log("No more hits are available, so finishing this turn.");
		}

		// check if piece must be crowned after the final move of the turn
		let mustCrown = this.gameBoard.checkCrown(x1, y1);
		if (mustCrown) {
			this.checkerBoard.crownPiece(x1, y1);
		}

		return this.finishTurn();
	}

	updateGrid(x0, y0, x1, y1, wasHit) {
		this.checkerBoard.movePiece(x0, y0, x1, y1);
		if (wasHit) {
			let hitPiece = {
				x: (x0 + x1) / 2,
				y: (y0 + y1) / 2
			};
			this.checkerBoard.capturePiece(hitPiece);
		}
		return this;
	}

	regenerateGrid() {
		this.checkerBoard.createPieces(this.gameBoard.board);
		return this;
	}

	updateSelection(x, y) {
		this.selected = { x, y };
	}

	select(x, y) {
		if (this.selected !== null && this.selected.x === x && this.selected.y === y) {
			//deselect
			this.selected = null;
			return this;
		}

		if (this.selected !== null && this.isValidMove(this.selected.x, this.selected.y, x, y)) {
			this.move(this.selected.x, this.selected.y, x, y);
			return this;
		}
		
		if (!this.isPieceSelectable(x, y)) {
			return this;
		}

		this.selected = { x, y };
	}
}

class Board {
	constructor(size) {
		this.size = size;
		this.board = [];

		this.piecesLeft = {};

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

	updatePiecesAmount() {
		this.piecesLeft = this.board.reduce((acc, row) => {
			row.forEach(piece => {
				if (piece < 0) acc[PLAYER_BLACK]++;
				else if (piece > 0) acc[PLAYER_WHITE]++;
			});
			return acc;
		}, { [PLAYER_BLACK]: 0, [PLAYER_WHITE]: 0 });
		return this;
	}

	isKing(x, y) {
		let piece = this.getPieceAt(x, y);
		return (piece === PIECES.kingBlack || piece === PIECES.kingWhite);
	}

	checkCrown(x, y) {
		let piece = this.getPieceAt(x, y);
		let player = this.getPiecePlayer(piece);
		
		if (this.isKing(x, y)) return false;

		if ((player === PLAYER_WHITE && y === 0) ||
			(player === PLAYER_BLACK && y === this.size - 1)) {
			this.crownPiece(x, y, piece);
			return true;
		}
		return false;
	}

	crownPiece(x, y, piece) {
		this.board[y].splice(x, 1, (piece * 2));
	}

	removePiece(x, y) {
		let piece = this.getPieceAt(x, y);
		this.board[y].splice(x, 1, NO_PIECE);
		this.updatePiecesAmount();
		return piece;
	}

	setPiece(x, y, piece) {
		this.board[y].splice(x, 1, piece);
		return this.updatePiecesAmount();;
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

	// Check all directions around square, and returns those that are valid
	// Also adds if it is forward or not (normally pieces can't move backwards)
	// Returns: Array of Objects {dx: +-1, dy: +-1, forward: Boolean}
	getValidDirections(x, y) {
		let type = this.getPieceAt(x, y);
		if (type === NO_PIECE) return [];
		return DIRECTIONS.filter(dir => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			return this.isValidSquare(x1, y1);
		}).map(dir => {
			let forward = true;
			if (type === PIECES.manWhite && dir.dy > 0) forward = false;
			else if (type === PIECES.manBlack && dir.dy < 0) forward = false;

			return { ...dir, forward };
		})
	}

	// Loop over validDirections, returning only those where the square is empty
	// Also checks if it is forward or not
	// Returns: Array of Objects with locations to which can be moved {x, y}
	getPieceMoves(x, y) {
		// let isKing = this.isKing(x, y);
		// const incrementPos = (x, y, dx, dy) => {
			// return { x: x + dx, y: y + dy };
		// } 

		return this.getValidDirections(x, y).reduce((moves, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquare = this.getPieceAt(x1, y1);

			if (!nextSquare && dir.forward) {
				// No piece on that square, and it is the right directions, so add to array
				moves.push({ x: x1, y: y1 });

				/*if (isKing) {
					// if king, push this direction and any subsequent until an invalid direction is found
					let nextPos = incrementPos(x1, y1, dir.dx, dir.dy);
					while (!this.getPieceAt(nextPos.x, nextPos.y)) {
						moves.push({ x: nextPos.x, y: nextPos.y });
						nextPos = incrementPos(nextPos.x, nextPos.y, dir.dx, dir.dy);
					}
				}*/
			}
			return moves;
		}, []);
	}

	// Loop over valid directions, returning only those where the square is inhabited
	//		by enemy piece, and the square beyond is empty and valid
	// Returns: Array of Objects with locations to which can be moved by hitting
	//		along with captured piece location { x, y, captured: {x, y} }
	getPieceHits(x, y) {
		let curPlayer = this.getPiecePlayer(this.getPieceAt(x, y));

		return this.getValidDirections(x, y).reduce((hits, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquare = this.getPieceAt(x1, y1);

			// Check if nextSquare has enemy piece
			if (nextSquare && curPlayer !== this.getPiecePlayer(nextSquare)) {
				// Check if next square is empty
				let x2 = dir.dx + x1;
				let y2 = dir.dy + y1;

				if (this.isValidSquare(x2, y2) && !this.getPieceAt(x2, y2)) {
					// TODO: is the captured property necessary?
					hits.push({ x: x2, y: y2, captured: { x: x1, y: y1 } });
				}
			}
			return hits;
		}, [])
	}

	// Checks both getPieceMoves and getPieceHits for possibilities (if a hit is found, only hits are returned)
	// This can then be sent to a recursive checker method for all hits
	// Returns: Array of all possible moves and paths that can be taken, with moves
	//				having a captured: null, and hits having a captured: {x, y}
	getPieceOptions(x, y) {
		let hits = this.getPieceHits(x, y);

		if (hits.length <= 0) {
			let moveObjects = this.getPieceMoves(x, y);
			return moveObjects.map(move => {
				return [{...move, captured: null}];
			});
		}

		let board = Board.copy(this);

		// Hits were found, so now to loop over all hits, and check for any subsequent hits
		let pathsForPiece = [];
		hits.forEach(hit => {
			board.makeMove(x, y, hit.x, hit.y);
			
			let nextHits = JSON.parse(JSON.stringify(board.getSubsequentHits(hit.x, hit.y)));
			pathsForPiece.push(...nextHits);

			board.undoMove();
		})
		return pathsForPiece;
	}

	// Checks for any subsequent hits, and if none are found returns the board history
	getSubsequentHits(x, y) {
		let hits = this.getPieceHits(x, y);

		if (hits.length <= 0) {
			let history = this.reduceHistory(this.history);
			return [history];
		}

		let paths = [];
		hits.forEach(hit => {
			// For each hit that was found, check for next hits and add a path for this chain
			this.makeMove(x, y, hit.x, hit.y);

			// Make recursive call here, and for each found add to array
			let nextPaths = this.getSubsequentHits(hit.x, hit.y);
			// TODO: iterate over paths?
			paths.push(...nextPaths);

			this.undoMove();
		})
		return paths;
	}

	reduceHistory(history) {
		return history.reduce((moves, move) => {
			if (move.capture) {
				moves.push({
					x: move.x1,
					y: move.y1,
					captured: {
						x: move.capture.x,
						y: move.capture.y
					}
				});
			}
			return moves;
		}, []);
	}

	getAllPieceOptions(player) {
		let playerPieces = [];

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				let piece = this.board[y][x];
				if (this.getPiecePlayer(piece) !== player) continue;

				let moves = this.getPieceOptions(x, y);
				if (moves.length <= 0) continue;

				playerPieces.push({
					piece: { x, y },
					paths: moves
				});
			}
		}
		return playerPieces;
	}

	// accepts the return value from getAllPieceOptions, and returns all hits if a hit was found, or everything (if no hit was found)
	filterMovesIfMustHit(pieces) {
		// The getPieceOptions method returns only hits or only moves, so only one path has to be checked for every piece
		let mustHit = false;
		for (let i = 0; i < pieces.length; i++) {
			if (pieces[i].paths[0][0].captured !== null) {
				mustHit = true;
				break;
			}
		}

		if (!mustHit) return pieces;
		return pieces.filter(piece => {
			return piece.paths[0][0].captured !== null;
		});
	}

	// accepts the return value from getAllPieceOptions (or the above filter)
	// returns all hit paths that are as long as the longest path
	filterSmallPaths(pieces) {
		let longestPath = 0;

		pieces.forEach(piece => piece.paths.forEach(path => {
			longestPath = Math.max(path.length, longestPath);
		}));

		return pieces.reduce((acc, piece) => {
			piece.paths = piece.paths.reduce((pathAcc, path) => {
				if (path.length < longestPath) return pathAcc;
				else {
					pathAcc.push(path);
					return pathAcc;
				}
			}, []);
			if (piece.paths.length > 0) {
				acc.push(piece);
			}
			return acc;
		}, [])
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

export { Checkers, Board };