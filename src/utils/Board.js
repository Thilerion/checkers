import { PLAYER_BLACK, PLAYER_WHITE, NO_PIECE, PIECES } from './constants.js';

const DIRECTIONS = [
	{ dx: 1, dy: -1 },
	{ dx: 1, dy: 1 },
	{ dx: -1, dy: 1 },
	{ dx: -1, dy: -1 }
];

class Board {
	constructor(size) {
		this.size = size;
		this.board = [];

		this.piecesLeft = {
			[PLAYER_BLACK]: 0,
			[PLAYER_WHITE]: 0
		};

		this.kingsLeft = {
			[PLAYER_BLACK]: 0,
			[PLAYER_WHITE]: 0
		}

		this.menLeft = {
			[PLAYER_BLACK]: 0,
			[PLAYER_WHITE]: 0
		}

		this.history = [];
	}

	static copy(oldBoard, keepHistory = false) {
		let newBoard = new Board(oldBoard.size);
		newBoard.board = JSON.parse(JSON.stringify(oldBoard.board));

		newBoard.piecesLeft = { ...oldBoard.piecesLeft };
		newBoard.kingsLeft = { ...oldBoard.kingsLeft };
		newBoard.menLeft = { ...oldBoard.menLeft };

		if (keepHistory) {
			newBoard.history = JSON.parse(JSON.stringify(oldBoard.history));
		}

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
		return this.updatePiecesAmount();
	}

	updatePiecesAmount() {
		let manBlack = 0;
		let manWhite = 0;
		let kingBlack = 0;
		let kingWhite = 0;

		this.board.forEach(row => {
			row.forEach(piece => {
				if (piece === PIECES.manBlack) {
					manBlack++;
				} else if (piece === PIECES.manWhite) {
					manWhite++;
				} else if (piece === PIECES.kingBlack) {
					kingBlack++;
				} else if (piece === PIECES.kingWhite) {
					kingWhite++;
				}
			})
		})

		this.piecesLeft = {
			[PLAYER_BLACK]: (manBlack + kingBlack),
			[PLAYER_WHITE]: (manWhite + kingWhite)
		};

		this.kingsLeft = {
			[PLAYER_BLACK]: kingBlack,
			[PLAYER_WHITE]: kingWhite
		};

		this.menLeft = {
			[PLAYER_BLACK]: manBlack,
			[PLAYER_WHITE]: manWhite
		};

		return this;
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
		if (x === undefined || !Number.isInteger(y)) {
			console.trace();
		}
		return this.board[y][x];
	}

	getPiecePlayer(piece) {
		if (piece === PIECES.manBlack || piece === PIECES.kingBlack) return PLAYER_BLACK;
		else if (piece === PIECES.manWhite || piece === PIECES.kingWhite) return PLAYER_WHITE;
		else return NO_PIECE;
	}

	isValidSquare(x, y) {
		return (x >= 0 && x < this.size) && (y >= 0 && y < this.size) && ((x + y) % 2 === 1);
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
		//this.board[y].splice(x, 1, (piece * 2));
		let crownedPiece;
		if (piece === PIECES.manBlack) {
			crownedPiece = PIECES.kingBlack;
		} else if (piece === PIECES.manWhite) {
			crownedPiece = PIECES.kingWhite;
		} else return this;

		this.removePiece(x, y);
		this.setPiece(x, y, crownedPiece);
		return this;
	}

	// Check all directions around square, and returns those that are valid
	// Also adds if it is forward or not (normally pieces can't move backwards)
	// Returns: Array of Objects {dx: +-1, dy: +-1, forward: Boolean}
	getValidDirections(x, y) {		
		let type = this.getPieceAt(x, y);
		if (type === NO_PIECE) return [];
		let player = this.getPiecePlayer(type);
		let isKing = this.isKing(x, y);

		const incrementPos = (x, y, dx, dy) => {
			return { x: x + dx, y: y + dy };
		}

		return DIRECTIONS.reduce((valids, dir) => {
			let forward =
				(player === PLAYER_BLACK && dir.dy > 0) ||
				(player === PLAYER_WHITE && dir.dy < 0) ||
				(isKing) ? true : false;
			
			let nextDir = { ...dir };
			let nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);

			// if position is valid, create a Dir object for it
			if (this.isValidSquare(nextPos.x, nextPos.y)) {
				let totalDir = { ...nextDir, forward };
				
				if (isKing) {
					totalDir.kingDiagonalDirs = [];
					nextDir = { dx: nextDir.dx + dir.dx, dy: nextDir.dy + dir.dy };
					nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);
				}

				while (isKing && this.isValidSquare(nextPos.x, nextPos.y)) {
					totalDir.kingDiagonalDirs.push({ ...nextDir });
					nextDir = { dx: nextDir.dx + dir.dx, dy: nextDir.dy + dir.dy };
					nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);
				}

				valids.push(totalDir);
			}
			return valids;
		}, []);
	}

	// Loop over validDirections, returning only those where the square is empty
	// Also checks if it is forward or not
	// Returns: Array of Objects with locations to which can be moved {x, y}
	getPieceMoves(x, y) {
		let isKing = this.isKing(x, y);
		return this.getValidDirections(x, y).reduce((moves, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquare = this.getPieceAt(x1, y1);

			if (!nextSquare && dir.forward) {
				// No piece on that square, and it is the right directions, so add to array
				moves.push({ x: x1, y: y1 });

				if (isKing && dir.kingDiagonalDirs.length > 0) {
					for (let i = 0; i < dir.kingDiagonalDirs.length; i++) {
						let newDir = dir.kingDiagonalDirs[i];
						x1 = newDir.dx + x;
						y1 = newDir.dy + y;
						nextSquare = this.getPieceAt(x1, y1);
						
						if (nextSquare) break;

						moves.push({ x: x1, y: y1 });
					}
				}
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
		let isKing = this.isKing(x, y);
		return this.getValidDirections(x, y).reduce((hits, dir) => {
			// check next square, or all next squares if king, for enemy piece
			// if yes, check next square, or all next squares if king, for empty piece
			// add next position, or all next positions if king, to hits array, along with coords of captured piece
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquare = this.getPieceAt(x1, y1);

			let foundEnemyPiece;
			let foundEnemyPieceDirIndex;

			if (nextSquare && curPlayer !== this.getPiecePlayer(nextSquare)) {
				// check next square
				foundEnemyPiece = {x: x1, y: y1};
			} else if (!nextSquare && isKing) {
				// if not found, and is king, check next squares in diagonal
				for (let i = 0; i < dir.kingDiagonalDirs.length && foundEnemyPiece == null; i++) {
					x1 = dir.kingDiagonalDirs[i].dx + x;
					y1 = dir.kingDiagonalDirs[i].dy + y;
					nextSquare = this.getPieceAt(x1, y1);
					if (nextSquare && curPlayer !== this.getPiecePlayer(nextSquare)) {
						foundEnemyPiece = { x: x1, y: y1 };
						foundEnemyPieceDirIndex = i;
					}
				}
			}

			// if no enemy piece found, in the nextSquare for man, in the diagonal for king, return hits
			if (!foundEnemyPiece) return hits;

			let x2 = dir.dx + foundEnemyPiece.x;
			let y2 = dir.dy + foundEnemyPiece.y;

			if (this.isValidSquare(x2, y2) && !this.getPieceAt(x2, y2)) {
				hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
			}

			if (isKing) {
				// if king, check where in the kingDiagonalDirs we left off, and resume from there
				// to check for more empty cells that can be added as hit option
				let startIndex = foundEnemyPieceDirIndex != null ? foundEnemyPieceDirIndex + 2 : 1;
				for (let j = startIndex; j < dir.kingDiagonalDirs.length; j++) {
					x2 = dir.kingDiagonalDirs[j].dx + x;
					y2 = dir.kingDiagonalDirs[j].dy + y;
					if (this.isValidSquare(x2, y2) && this.getPieceAt(x2, y2) === NO_PIECE) {
						hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
					} else {
						break;
					}
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
			board.makeMove(x, y, hit.x, hit.y, hit.captured);
			
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
			this.makeMove(x, y, hit.x, hit.y, hit.captured);

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
			if (move.captured) {
				moves.push({
					x: move.x1,
					y: move.y1,
					captured: {
						x: move.captured.x,
						y: move.captured.y,
						type: move.captured.type
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

	makeMove(x0, y0, x1, y1, captured = null) {
		let move = { x0, x1, y0, y1 };

		if (captured != null) {
			move.captured = captured;
			let captureType = this.getPieceAt(captured.x, captured.y);
			move.captured.type = captureType;
			this.removePiece(captured.x, captured.y);
		}

		let movedPiece = this.removePiece(x0, y0);
		this.setPiece(x1, y1, movedPiece);

		this.history.push(move);
		return this;
	}

	undoMove() {
		let move = this.history.pop();

		let movedPiece = this.removePiece(move.x1, move.y1);
		this.setPiece(move.x0, move.y0, movedPiece);

		if (!!move.captured) {
			this.setPiece(move.captured.x, move.captured.y, move.captured.type);
		}

		return this;
	}
}

export default Board;