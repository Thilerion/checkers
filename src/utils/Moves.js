import { PLAYER_BLACK, PLAYER_WHITE, NO_PIECE, PIECES, RULES } from './constants.js';
import GameState from './GameState.js';

class Moves {
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

	_simulateMove(x0, y0, x1, y1, captured = null) {
		let move = { x0, y0, x1, y1 };
		if (captured != null) {
			move.captured = captured;
			move.captured.type = this.board[captured.y][captured.x];
			this.board[captured.y][captured.x] = NO_PIECE;
		}

		let movedPiece = this.board[y0][x0];
		this.board[y0][x0] = NO_PIECE;
		this.board[y1][x1] = movedPiece;

		this.hitHistory.push(move);
		return this;
	}

	_undoMove() {
		this.hitHistory = this.hitHistory.slice();
		let move = this.hitHistory.pop();

		let movedPiece = this.board[move.y1][move.x1];
		this.board[move.y1][move.x1] = NO_PIECE;
		this.board[move.y0][move.x0] = movedPiece;

		if (!!move.captured) {
			this.board[move.captured.y][move.captured.x] = move.captured.type;
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
				moves.push({ x: x1, y: y1 });

				if (isKing && dir.kingDiagonalDirs.length > 0) {
					for (let i = 0; i < dir.kingDiagonalDirs.length; i++) {
						let newDir = dir.kingDiagonalDirs[i];
						x1 = newDir.dx + x;
						y1 = newDir.dy + y;
						nextSquare = this.board[y1][x1];
						
						if (nextSquare) break;

						moves.push({ x: x1, y: y1 });
					}
				}
			}
			return moves;
		}, [])
	}

	_getPieceHits(x, y) {
		const isKing = this._isKing(x, y);

		return this._getValidPieceDirections(x, y).reduce((hits, dir) => {
			// check next square, or all next squares if king, for enemy piece
			// if yes, check next square, or all next squares if king, for empty piece
			// add next position, or all next positions if king, to hits array, along with coords of captured piece
			let x1 = dir.dx + x;
			let y1 = dir.dy + y;
			let nextSquareEmpty = this._isEmptySquare(x1, y1);

			let foundEnemyPiece;
			let foundEnemyPieceDirIndex;

			if (!nextSquareEmpty && !this._isPieceFromPlayer(x1, y1)) {
				// check next square
				foundEnemyPiece = {x: x1, y: y1};
			} else if (nextSquareEmpty && isKing) {
				// if not found, and is king, check next squares in diagonal
				for (let i = 0; i < dir.kingDiagonalDirs.length && foundEnemyPiece == null; i++) {
					x1 = dir.kingDiagonalDirs[i].dx + x;
					y1 = dir.kingDiagonalDirs[i].dy + y;
					nextSquareEmpty = this._isEmptySquare(x1, y1);
					if (!nextSquareEmpty && !this._isPieceFromPlayer(x1, y1)) {
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
				hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
			}

			if (isKing) {
				// if king, check where in the kingDiagonalDirs we left off, and resume from there
				// to check for more empty cells that can be added as hit option
				let startIndex = foundEnemyPieceDirIndex != null ? foundEnemyPieceDirIndex + 2 : 1;
				for (let j = startIndex; j < dir.kingDiagonalDirs.length; j++) {
					x2 = dir.kingDiagonalDirs[j].dx + x;
					y2 = dir.kingDiagonalDirs[j].dy + y;
					if (this._isValidSquare(x2, y2) && this._isEmptySquare(x2, y2)) {
						hits.push({ x: x2, y: y2, captured: { x: foundEnemyPiece.x, y: foundEnemyPiece.y } });
					} else {
						break;
					}
				}
			}
			return hits;
		}, [])
	}

	_getPieceOptions(x, y) {
		let hits = this._getPieceRecursiveHits(x, y);

		let options = [];
		let mustHit = false;
		let longest = 0;

		if (hits.length <= 0) {
			let moves = this._getPieceMoves(x, y);
			if (moves || moves.length > 0) longest = 1;
			options.push(...moves.map(move => {
				return [{ ...move, captured: null }];
			}));
		} else {
			mustHit = true;
			longest = hits.reduce((max, val) => {
				return Math.max(max, val.length);
			}, 0)
			options.push(...hits);
		}
		return { piece: {x, y}, mustHit, moves: options, longest };
	}

	_getPieceRecursiveHits(x, y) {
		let paths = [];

		const getNextHits = (x, y) => {
			let nextHits = this._getPieceHits(x, y).map(h => {
				return { x: h.x, y: h.y, captured: h.captured };
			});

			if (nextHits.length <= 0) {
				let curPath = JSON.parse(JSON.stringify(this.hitHistory)).map(path => {
					return { x: path.x1, y: path.y1, captured: path.captured };
				})
				paths.push(curPath);
				return;
			}

			nextHits.forEach(nextHit => {
				this._simulateMove(x, y, nextHit.x, nextHit.y, nextHit.captured);
				getNextHits(nextHit.x, nextHit.y);
				this._undoMove();
			})
		}

		let initialHits = this._getPieceHits(x, y).map(h => {
			return { x: h.x, y: h.y, captured: h.captured };
		});

		initialHits.forEach(initHit => {
			this._simulateMove(x, y, initHit.x, initHit.y, initHit.captured);
			getNextHits(initHit.x, initHit.y);
			this._undoMove();
		})

		return paths;
	}

	_createValidMoves() {
		// TODO: only longest length
		let moves = [];
		let mustHit = false;

		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				if (this._isPieceFromPlayer(x, y)) {
					let pieceOptions = this._getPieceOptions(x, y);
					moves.push(pieceOptions);
					if (pieceOptions.mustHit && !mustHit) {
						mustHit = true;
					}	
				}
			}
		}

		// TODO: filter the first few moves for mustHits

		this.validMoves = moves;
		
		return this;
	}
}

export default Moves;

//let gameState = new GameState({ ...RULES, size: 10 }).createInitial();
let gameState = new GameState({ ...RULES, size: 10 }).addPiece(4, 5, 1).addPiece(3, 4, -1).addPiece(1, 4, -1);
let arr = gameState.create2dArray();
let m = new Moves({ size: 10, captureBack: true, flyingKings: true });
m.findValidMoves(arr, PLAYER_WHITE); /*?*/
