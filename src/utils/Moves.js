import { PLAYER_BLACK, PLAYER_WHITE, NO_PIECE, PIECES } from './constants.js';
import { Move, MovePath, ValidMoves } from './MoveClasses.js';

export default class Moves {
	constructor(options) {
		const { size, captureBack, flyingKings } = options;

		this.size = size;
		this.captureBack = captureBack;
		this.flyingKings = flyingKings;

		this.directions = [
			{ dx: 1, dy: -1 },
			{ dx: 1, dy: 1 },
			{ dx: -1, dy: 1 },
			{ dx: -1, dy: -1 }
		];

		this.board = [];
		this.validMoves = [];
		this.player = null;

		this.hitHistory = [];
	}

	findValidMoves(boardArr, player) {
		this.board = boardArr;
		this.player = player;
		this.validMoves = [];
		this._createValidMoves();

		return this.validMoves;
	}

	// Returns the piece, if found, in the validMoves array
	// Contains {longest, mustHit, piece: {x, y}, and moves: [Array with paths]}
	getPieceInValidMoves(x, y) {
		return this.validMoves.find(pieces => {
			return pieces.piece.x === x && pieces.piece.y === y;
		}) || [];
	}

	getPiecePathsWithVisitedSquare(pieceX, pieceY, visitedX, visitedY) {
		let piecePaths = this.getPieceInValidMoves(pieceX, pieceY).moves;

		return piecePaths.filter(path => {
			return path.some(move => move.x === visitedX && move.y === visitedY);
		});
	}

	isValidCapture(pieceX, pieceY, captureX, captureY) {
		let piecePaths = this.getPieceInValidMoves(pieceX, pieceY).moves;

		return piecePaths.some(path => {
			if (!path || !path.length) return false;
			return path.some(move => move.captured != null && move.captured.x === captureX && move.captured.y === captureY);
		});
	}

	// Returns array of paths the piece can take, if any
	movesForPiece(x, y) {
		let pieceMoves = this.validMoves.find(pieces => {
			return pieces.piece.x === x && pieces.piece.y === y;
		});
		if (!pieceMoves) return [];
		return pieceMoves.moves;
	}

	getAmountMoveablePieces() {
		return this.validMoves.length;
	}	

	// Returns if the chosen move is in the validMoves array
	isValidMove(x0, y0, x1, y1) {
		let pieceMove = this.movesForPiece(x0, y0);

		console.log({ x0, y0, x1, y1 }, pieceMove);
		
		if (!pieceMove) return false;

		let foundMoveInPath = pieceMove.find(move => {
			return move[move.length - 1].x === x1 && move[move.length - 1].y === y1;
		})

		console.log(JSON.parse(JSON.stringify(foundMoveInPath)));
		return !!foundMoveInPath;
	}
	

	getMovePath(x0, y0, x1, y1) {
		// with final destination
		let pieceMove = this.movesForPiece(x0, y0);

		if (!pieceMove) return;

		return pieceMove.find(move => {
			return move[move.length - 1].x === x1 && move[move.length - 1].y === y1;
		});
	}

	_isKing(x, y) {
		return this.board[y][x] === PIECES.kingBlack || this.board[y][x] === PIECES.kingWhite;
	}

	_isValidSquare(x, y) {
		return (x >= 0 && x < this.size) && (y >= 0 && y < this.size) && ((x + y) % 2 === 1);
	}

	_getPiecePlayer(x, y) {
		let piece = this.board[y][x];
		if (piece === PIECES.manBlack || piece === PIECES.kingBlack) return PLAYER_BLACK;
		else if (piece === PIECES.manWhite || piece === PIECES.kingWhite) return PLAYER_WHITE;
		else return NO_PIECE;
	}

	_isEmptySquare(x, y) {
		return this.board[y][x] === NO_PIECE;
	}

	_isPieceFromPlayer(x, y) {
		return this._getPiecePlayer(x, y) === this.player;
	}

	_simulateMove(move) {
		if (!(move instanceof Move)) {
			throw new Error("Simulate move needs a move object!");
		}
		const { captured, from, to, typeId } = move;

		if (captured != null) {
			this.board[captured.y][captured.x] = NO_PIECE;
		}

		this.board[from.y][from.x] = NO_PIECE;
		this.board[to.y][to.x] = typeId;

		this.hitHistory.push(move);
		return this;
	}

	_undoMove() {
		this.hitHistory = this.hitHistory.slice();

		const {captured, from, to, typeId} = this.hitHistory.pop();

		this.board[from.y][from.x] = typeId;
		this.board[to.y][to.x] = NO_PIECE;

		if (captured != null) {
			this.board[captured.y][captured.x] = captured.typeId;
		}

		return this;
	}

	_getValidPieceDirections(x, y) {
		if (this.board[y][x] === NO_PIECE || !this._isPieceFromPlayer(x, y)) {
			console.warn("Can't get directions for this piece.");
			return [];
		}

		const isKing = this._isKing(x, y);

		const incrementPos = (x, y, dx, dy) => {
			return { x: x + dx, y: y + dy };
		}

		return this.directions.reduce((valids, dir) => {
			let forward =
				(this.player === PLAYER_BLACK && dir.dy > 0) ||
					(this.player === PLAYER_WHITE && dir.dy < 0) ||
					(isKing) ? true : false;
			
			let nextDir = { ...dir };
			let nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);

			// if position is valid, create a Dir object for it
			if (this._isValidSquare(nextPos.x, nextPos.y)) {
				let totalDir = { ...nextDir, forward };
				
				if (isKing) {
					totalDir.kingDiagonalDirs = [];
					nextDir = { dx: nextDir.dx + dir.dx, dy: nextDir.dy + dir.dy };
					nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);
				}

				while (isKing && this._isValidSquare(nextPos.x, nextPos.y)) {
					totalDir.kingDiagonalDirs.push({ ...nextDir });
					nextDir = { dx: nextDir.dx + dir.dx, dy: nextDir.dy + dir.dy };
					nextPos = incrementPos(x, y, nextDir.dx, nextDir.dy);
				}

				valids.push(totalDir);
			}
			return valids;
		}, []);
	}

	_getPieceMoves(x, y) {
		const isKing = this._isKing(x, y);
		return this._getValidPieceDirections(x, y).reduce((moves, dir) => {
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquare = this.board[y1][x1];

			if (!nextSquare && dir.forward) {
				// No piece on that square, and it is the right directions, so add to array
				moves.push(new MovePath([new Move(x, y).setDestination(x1, y1).setTypeId(this.board[y][x])]));

				if (isKing && dir.kingDiagonalDirs.length > 0) {
					for (let i = 0; i < dir.kingDiagonalDirs.length; i++) {
						let newDir = dir.kingDiagonalDirs[i];
						x1 = newDir.dx + x;
						y1 = newDir.dy + y;
						nextSquare = this.board[y1][x1];
						
						if (nextSquare) break;

						moves.push(new MovePath([new Move(x, y).setDestination(x1, y1).setTypeId(this.board[y][x])]));
					}
				}
			}
			return moves;
		}, []);
	}

	_getPieceHits(x, y) {
		const isKing = this._isKing(x, y);

		const pieceHits = this._getValidPieceDirections(x, y).reduce((hits, dir) => {
			// check next square, or all next squares if king, for enemy piece
			// if yes, check next square, or all next squares if king, for empty piece
			// add next position, or all next positions if king, to hits array, along with coords of captured piece
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			// debugger;
			let nextSquareEmpty = this._isEmptySquare(x1, y1);

			let foundEnemyPiece;
			let foundEnemyPieceDirIndex;

			if (!nextSquareEmpty && !this._isPieceFromPlayer(x1, y1)) {
				// check next square
				foundEnemyPiece = { x: x1, y: y1 };
			} else if (nextSquareEmpty && isKing) {
				// if not found, and is king, check next squares in diagonal for enemy piece
				for (let i = 0; i < dir.kingDiagonalDirs.length - 1 && foundEnemyPiece == null; i++) {
					x1 = dir.kingDiagonalDirs[i].dx + x;
					y1 = dir.kingDiagonalDirs[i].dy + y;
					nextSquareEmpty = this._isEmptySquare(x1, y1);
					if (!nextSquareEmpty && !this._isPieceFromPlayer(x1, y1)) {
						// if an enemy piece is found, this might be
						// a valid hit (IF EMPTY CELL AFTER TODO:)
						foundEnemyPiece = { x: x1, y: y1 };
						foundEnemyPieceDirIndex = i;
					}
				}
			}

			// if no enemy piece found, in the nextSquare for man, in the diagonal for king, return hits
			if (!foundEnemyPiece) return hits;

			let x2 = dir.dx + foundEnemyPiece.x;
			let y2 = dir.dy + foundEnemyPiece.y;

			if (this._isValidSquare(x2, y2) && this._isEmptySquare(x2, y2)) {
				const m = new Move(x, y).setTypeId(this.board[y][x]).setDestination(x2, y2).setCapture(foundEnemyPiece.x, foundEnemyPiece.y, this.board[foundEnemyPiece.y][foundEnemyPiece.x]);
				// hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
				hits.push(m);
			}

			if (this._isValidSquare(x2, y2) && this._isEmptySquare(x2, y2) && isKing) {
				// if king, check where in the kingDiagonalDirs we left off, and resume from there
				// to check for more empty cells that can be added as hit option
				let startIndex = foundEnemyPieceDirIndex != null ? foundEnemyPieceDirIndex + 2 : 1;
				for (let j = startIndex; j < dir.kingDiagonalDirs.length; j++) {
					x2 = dir.kingDiagonalDirs[j].dx + x;
					y2 = dir.kingDiagonalDirs[j].dy + y;
					if (this._isValidSquare(x2, y2) && this._isEmptySquare(x2, y2)) {
						const m = new Move(x, y).setTypeId(this.board[y][x]).setDestination(x2, y2).setCapture(foundEnemyPiece.x, foundEnemyPiece.y, this.board[foundEnemyPiece.y][foundEnemyPiece.x]);
						// hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
						hits.push(m);
					} else {
						break;
					}
				}
			}
			return hits;
		}, [])

		// debugger;
		return pieceHits;
	}

	_getPieceOptions(x, y, onlyLongest = true) {
		let piecePaths = this._getPieceRecursiveHits(x, y);

		let options = [];
		let mustHit = false;
		let longest = 0;

		if (piecePaths.length <= 0) {
			let movePaths = this._getPieceMoves(x, y);
			if (movePaths && movePaths.length > 0) {
				longest = 1;
				options.push(...movePaths);
			} else {
				return;
			}
		} else {
			mustHit = true;
			longest = piecePaths.reduce((max, val) => {
				console.log(val.amount());
				return Math.max(max, val.amount());
			}, 0)
			
			if (!onlyLongest) {
				options.push(...piecePaths);
			} else if (onlyLongest) {
				piecePaths.forEach(path => {
					if (path.amount() >= longest) options.push(path);
				})
			}
		}
		return { piece: { x, y }, mustHit, paths: options, longest };
	}

	_getPieceRecursiveHits(x, y) {
		let paths = [];

		const getNextHits = (x, y) => {
			let nextHits = this._getPieceHits(x, y);

			if (nextHits.length <= 0) {
				let curPath = this.hitHistory.slice().map(move => move.copy());
				paths.push(new MovePath(curPath));
				return;
			}

			nextHits.forEach(nextHit => {
				this._simulateMove(nextHit);
				getNextHits(nextHit.to.x, nextHit.to.y);
				this._undoMove();
			})
		}

		let initialHits = this._getPieceHits(x, y);

		initialHits.forEach(initHit => {
			this._simulateMove(initHit);
			getNextHits(initHit.to.x, initHit.to.y);
			this._undoMove();
		})

		return paths;
	}

	_createValidMoves(onlyLongest = true) {
		const allPiecePaths = [];
		let mustHit = false;
		let longest = 0;

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				if (!this._isPieceFromPlayer(x, y)) continue;

				const piecePaths = this._getPieceOptions(x, y, onlyLongest);

				if (piecePaths != null) {
					allPiecePaths.push(piecePaths);
					
					if (!mustHit && piecePaths.mustHit) mustHit = true;
					if (piecePaths.longest > longest) longest = piecePaths.longest;
				}
			}
		}
		const filtered = allPiecePaths.filter(piece => {
			let isLongEnough = true;
			let isHitIfMustHit = true;
			if (onlyLongest) {
				isLongEnough = piece.longest >= longest;
			}
			if (mustHit) {
				isHitIfMustHit = !!piece.mustHit;
			}
			return isLongEnough && isHitIfMustHit;
		});

		const movePaths = filtered.reduce((allPaths, piece) => {
			allPaths.push(...piece.paths);
			return allPaths;
		}, [])

		this.validMoves = new ValidMoves(movePaths);
		return this;
	}
}