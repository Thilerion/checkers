import { NO_PIECE, PIECES, PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, PIECE_MAN, GET_PIECE_PLAYER, GET_PIECE_TYPE, TIE } from './constants.js';
import Piece from './Piece.js';

export default class GameState {
	constructor(options, moves) {
		const { size, startingPlayer, autoDrawAfterNoCaptures } = options;

		this.size = size;
		this.pieces = [];
		this.history = [];

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
			console.log(x, y, typeId);
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
			board[piece.y][piece.x] = ` ${piece.toString()} |`;
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

	_doMove(x0, y0, path) {
		const piece = this.pieces.find(piece => piece.x === x0 && piece.y === y0 && piece.alive);
		
		let start = { x: x0, y: y0, typeId: piece.typeId };
		let end = { x: null, y: null, typeId: null };
		let captures = [];
		let wasCrowned = false;

		for (let i = 0; i < path.length; i++) {
			let move = path[i];
			if (move.captured) {
				captures.push({ ...move.captured });
				this._capturePiece(move.captured.x, move.captured.y, move.captured.type);
			}
			if (i === path.length - 1) {
				end.x = move.x;
				end.y = move.y;
				if (this._shouldCrown(move.y)) {
					piece.crown();
					end.typeId = piece.typeId;
					wasCrowned = true;
				} else {
					end.typeId = start.typeId;
				}
			}
		}

		piece.move(end.x, end.y);

		this.history.push({ start, end, captures, wasCrowned });

		if (captures.length > 0) {
			this._resetNoCaptureCounter();
		} else {
			this._increaseNoCaptureCounter();
		}

		return this.nextTurn();
	}

	_undoMove() {
		const { start, end, captures, wasCrowned } = this.history.pop();
		const piece = this.pieces.find(piece => {
			return piece.x === end.x && piece.y === end.y && piece.typeId === end.typeId;
		});

		piece.move(start.x, start.y);
		if (wasCrowned) {
			piece.decrown();
		}

		if (captures.length > 0) {
			this._decreaseNoCaptureCounter();
			captures.forEach(cap => {
				this.pieces.find(piece => {
					return piece.x === cap.x && piece.y === cap.y && piece.typeId === cap.type;
				}).revive();
			})
		}
		return this.previousTurn();
	}

	_capturePiece(x, y, typeId) {
		this.pieces.find(piece => {
			return piece.x === x &&
				piece.y === y &&
				piece.typeId === typeId;
		}).capture();
		return this;
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

	previousTurn() {
		this.moveNumber--;
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this;
	}
}