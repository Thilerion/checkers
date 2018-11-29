import { NO_PIECE, PIECES, PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, PIECE_MAN, GET_PIECE_PLAYER, GET_PIECE_TYPE, TIE } from './constants.js';
import Piece from './Piece.js';
import { History, HistoryItem } from './History.js';

export default class GameState {
	constructor(options, moves) {
		const { size, startingPlayer, autoDrawAfterNoCaptures } = options;

		this.size = size;
		this.pieces = [];
		this.history = new History();

		this.startingPlayer = startingPlayer;
		this.currentPlayer = startingPlayer;
		this.moveNumber = 0;	
		
		this.moves = moves;

		this.autoDrawAfterNoCaptures = autoDrawAfterNoCaptures;
		this.noCaptureCounter = 0;

		this.gameOver = false;
		this.winner = null;
	}

	_importBoard(pieces) {
		this.pieces = pieces.map(([x, y, typeId]) => {
			return new Piece(x, y, typeId);
		});
				
		return this;
	}

	_hasMoves() {
		return this.moves.validMoves.length > 0;
	}

	_playerPiecesLeft(player) {
		return this.pieces.filter(piece => piece.player === player && piece.alive);
	}

	_piecesLeft() {
		const blackPieces = this._playerPiecesLeft(PLAYER_BLACK);
		const blackKings = blackPieces.filter(piece => piece.isKing());

		const whitePieces = this._playerPiecesLeft(PLAYER_WHITE);
		const whiteKings = blackPieces.filter(piece => piece.isKing());

		return {
			blackTotal: blackPieces.length,
			whiteTotal: whitePieces.length,
			kingBlack: blackKings.length,
			kingWhite: whiteKings.length,
			manBlack: blackPieces.length - blackKings.length,
			manWhite: whitePieces.length - whiteKings.length
		};
	}

	isGameOver() {
		// returns true if game has ended because no more moves,
		// 		no more pieces, or one of the draw conditions

		// No more moves? Enemy wins
		if (!this.gameOver && !this._hasMoves) {
			this.gameOver = true;
			this.winner = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		}

		// No more pieces? Enemy wins
		const piecesLeft = this._piecesLeft();
		if (!this.gameOver && piecesLeft.blackTotal <= 0) {
			this.gameOver = true;
			this.winner = PLAYER_WHITE;
		} else if (!this.gameOver && piecesLeft.whiteTotal <= 0) {
			this.gameOver = true;
			this.winner = PLAYER_BLACK;
		}

		// No captures for more moves than allowed? Draw
		if (!this.gameOver && this.noCaptureCounter >= this.autoDrawAfterNoCaptures) {
			this.gameOver = true;
			this.winner = TIE;
		}		

		return this.gameOver;
	}

	_createPiece(x, y, typeId) {
		return new Piece(x, y, typeId);
	}

	createInitial() {
		this.pieces = [];
		let rowsPerPlayer = (this.size / 2) - 1;
		let piecesPerRow = this.size / 2;

		for (let i = 0; i < rowsPerPlayer; i++) {
			for (let j = 0; j < piecesPerRow; j++) {
				let manBlack, manWhite;
				if (i % 2 === 0) {
					manBlack = this._createPiece(j * 2 + 1, i, PIECES.manBlack);
					manWhite = this._createPiece(j * 2, this.size - i - 1, PIECES.manWhite);
				} else {
					manBlack = this._createPiece(j * 2, i, PIECES.manBlack);
					manWhite = this._createPiece(j * 2 + 1, this.size - i - 1, PIECES.manWhite);
				}
				this.pieces.push(manBlack, manWhite);
			}
		}
		return this;
	}

	createEmpty2dArray() {
		return Array(this.size).fill(null).map(row => Array(this.size).fill(NO_PIECE));
	}

	create2dArray() {
		let arr = this.createEmpty2dArray();

		this.pieces.forEach(piece => {
			if (piece.alive) {
				arr[piece.y][piece.x] = piece.typeId;
			}
		})

		return arr;
	}

	ascii() {
		let divider = `  *${"-".repeat(this.size * 4 - 1)}*`;

		let board = this.createEmpty2dArray().map((row, y) => {
			return row.map((cell, x) => (x + y) % 2 === 0 ? "   |" : " . |");
		});

		this.pieces.forEach(piece => {
			if (piece.alive) {
				board[piece.y][piece.x] = ` ${piece.toString()} |`;
			}			
		})

		return [
			`  ${Array(this.size).fill("").map((val, x) => ` ${x}  `).join('')}`,
			divider,
			...board.map((row, y) => {
				return `${y} |${row.join('')}`;
			}),
			divider
		].join('\n');
	}

	addPiece(x, y, typeId) {
		this.pieces.push(this._createPiece(x, y, typeId));
		return this;
	}

	removePiece(x, y) {
		let index = this.pieces.findIndex(piece => piece.x === x && piece.y === y);
		this.pieces.splice(index, 1);
		return this;
	}

	_shouldCrown(y) {
		return (this.currentPlayer === PLAYER_BLACK && y === this.size - 1) ||
			(this.currentPlayer === PLAYER_WHITE && y === 0);
	}

	_recordHistory(uid, start, moves, capturedPieces, wasCrowned) {
		const historyItem = {
			start,
			wasCrowned,
			uid,
			end: moves[moves.length - 1],
			captures: capturedPieces.map(capturedPiece => {
				console.log({capturedPiece});
				const {x, y, typeId, uid} = capturedPiece;
				return {x, y, typeId, uid};
			})
		};

		this.history.push(historyItem);
	}

	_findPiece(props) {
		let piecesFound = this.pieces.filter(piece => {
			for (let prop in props) {
				let val = props[prop];
				if (piece[prop] !== val) return false;
			}
			return true;
		})

		if (piecesFound.length > 1) debugger;

		return piecesFound[0];
	}

	_processMove(x0, y0, path) {
		const piece = this._findPiece({x: x0, y: y0, alive: true});
		const start = {x: x0, y: y0, typeId: piece.typeId};
		const moves = [];
		const capturedPieces = [];
		let wasCrowned = false;
		
		path.forEach((move, i) => {
			if (move.captured) {
				let capturedPiece = this._findPiece({x: move.captured.x, y: move.captured.y, typeId: move.captured.type, alive: true});
				capturedPieces.push(capturedPiece);
			}
			moves.push({
				x: move.x,
				y: move.y
			});
			if (i === path.length - 1 && !piece.isKing() && this._shouldCrown(move.y)) {
				wasCrowned = true;
			}
		})
		return {piece, start, moves, capturedPieces, wasCrowned};
	}

	_doSingleMove(move, finished) {
		if (this.gameOver) {
			console.error("Can't make a move when the game is over!");
		}

		const piece = this._findPiece({ x: move.from.x, y: move.from.y, alive: true });

		this.history.addMove(move, finished, piece.player, piece.uid);

		if (finished && !piece.isKing() && this._shouldCrown(move.to.y)) {
			this.history.lastItem().setWasCrowned(true);
			piece.crown();
		}

		piece.move(move.to.x, move.to.y);

		if (move.captured != null) {
			this._findPiece(move.captured).capture();
		}

		if (finished && move.captured != null) {
			this._resetNoCaptureCounter();
		} else if (finished && move.captured == null) {
			this._increaseNoCaptureCounter();
		}

		if (finished) {
			return this.nextTurn();
		} else return this;
	}

	_undoMove() {
		const { wasCrowned, uid, initialPos, currentPos, revivePieces, wasFinished } = this.history.undo();

		const piece = this._findPiece({ uid, alive: true, x: currentPos.x, y: currentPos.y });

		piece.move(initialPos.x, initialPos.y);

		if (wasCrowned) {
			piece.decrown();
		}

		revivePieces.forEach(cap => {
			this._findPiece({ ...cap, alive: false }).revive();
		})

		if (revivePieces.length > 0) {
			this._decreaseNoCaptureCounter();
		}
		return this.previousTurn(wasFinished);
	}

	_increaseNoCaptureCounter() {
		this.noCaptureCounter++;
		return this;
	}

	_resetNoCaptureCounter() {
		this.noCaptureCounter = 0;
		return this;
	}

	_decreaseNoCaptureCounter() {
		if (this.noCaptureCounter > 0) {
			this.noCaptureCounter--;
		}
		return this;
	}

	nextTurn() {
		this.moveNumber++;
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}

	previousTurn(reduceMoveNumber = true) {
		if (reduceMoveNumber) {
			this.moveNumber--;
		}

		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}
}