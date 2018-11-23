import { TIE, PLAYER_BLACK, PLAYER_WHITE, RULES } from './constants.js';
import { Grid } from './grid-ui.js';
import Board from './Board.js';

class Checkers {
	constructor(options = RULES) {
		const { size, firstMove, captureBack, flyingKings, automaticDrawAfterMoves } = options;
		this.size = size;
		this.firstMove = firstMove;
		this.captureBack = captureBack;
		this.flyingKings = flyingKings;
		this.automaticDrawAfterMoves = automaticDrawAfterMoves;

		this.gameBoard = new Board(this.size).createBoard().addInitialPieces();
		this.checkerBoard = new Grid(this.size).createPieces(this.gameBoard.board);

		this.currentPlayer = this.firstMove;
		this.selected = null;
		this.currentPaths = [];
		this.piecesLeft = {};

		this.gameEnd = false;
		this.winner = null;

		this.moveNumber = 0;

		this.drawCounters = {
			oneKingTwoPieces: null,
			oneKingThreePieces: null,
			noCapturesOnlyKingsMoved: null
		}

		this.initializeTurn();
	}

	initializeTurn() {
		let turnOptions = this.gameBoard.getAllPieceOptions(this.currentPlayer);

		let filteredMoves = this.gameBoard.filterMovesIfMustHit(turnOptions);
		let filteredLengths = this.gameBoard.filterSmallPaths(filteredMoves);

		this.currentPaths = filteredLengths;
		return this.checkLoss();
	}

	checkLoss() {
		// lose if no moves available
		if (this.currentPaths.length <= 0) {
			this.gameEnd = true;
			this.winner = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		}
		return this;
	}

	checkWin() {
		if (this.gameBoard.piecesLeft[PLAYER_BLACK] === 0) {
			// white has won
			this.gameEnd = true;
			this.winner = PLAYER_WHITE;
		} else if (this.gameBoard.piecesLeft[PLAYER_WHITE] === 0) {
			// black has won
			this.gameEnd = true;
			this.winner = PLAYER_BLACK;
		}
		return this;
	}

	checkDraw() {
		// debugger;
		const kingsLeft = this.gameBoard.kingsLeft;
		const piecesLeft = this.gameBoard.piecesLeft;

		const PW = PLAYER_WHITE;
		const PB = PLAYER_BLACK;

		/* draw / remise if:
			1.	one king against at most 2 pieces (among which is 1+ king) after 5 moves
			2.	one king against at most 3 pieces (among which is 1+ king) after 16 moves
			3.	25 moves each (in sequence) have been made only using kings,
					and no pieces have been captured
		*/

		/* OWN RULE:
			draw if more moves than in options ('automaticDrawAfterMoves')
		*/

		// TODO: draw condition 3 must still be implemented

		if (this.drawCounters.oneKingTwoPieces > 10 ||
			this.drawCounters.oneKingThreePieces > 32 ||
			this.moveNumber > (this.automaticDrawAfterMoves * 2)) {
			this.gameEnd = true;
			this.winner = TIE;
			return this;
		}
		
		if (this.drawCounters.oneKingTwoPieces != null) {
			this.drawCounters.oneKingTwoPieces++;
		} else {
			// check if should be set to one
			if (kingsLeft[PW] === 1 && piecesLeft[PW] === 1 && kingsLeft[PB] >= 1 && piecesLeft[PB] <= 2) {
				this.drawCounters.oneKingTwoPieces = 1;
			} else if (kingsLeft[PB] === 1 && piecesLeft[PB] === 1 && kingsLeft[PW] >= 1 && piecesLeft[PW] <= 2) {
				this.drawCounters.oneKingTwoPieces = 1;
			}
		}

		if (this.drawCounters.oneKingThreePieces != null) {
			this.drawCounters.oneKingThreePieces++;
		} else {
			// check if should be set to one
			if (kingsLeft[PW] === 1 && piecesLeft[PW] === 1 && kingsLeft[PB] >= 1 && piecesLeft[PB] <= 3) {
				this.drawCounters.oneKingThreePieces = 1;
			} else if (kingsLeft[PB] === 1 && piecesLeft[PB] === 1 && kingsLeft[PW] >= 1 && piecesLeft[PW] <= 3) {
				this.drawCounters.oneKingThreePieces = 1;
			}
		}
			
		return this;
	}

	checkGameEnd() {
		// Official rulebook: https://docs.google.com/file/d/1GTDH8rHlracUIqkry5aRVwybIiLfLaHy/view?rm=minimal
		// win if opponent no pieces left
		this.checkWin();
		if (this.gameEnd) return this;
		return this.checkDraw();
	}

	finishTurn() {
		this.currentPaths = [];
		this.selected = null;

		if (!this.gameEnd) {
			return this.nextPlayer().initializeTurn().checkGameEnd();
		}
	}

	nextPlayer() {
		this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
		return this.incrementMoveNumber();
	}

	incrementMoveNumber() {
		if (this.currentPlayer === this.firstMove) {
			this.moveNumber++;
		}
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

	getMovePath(x0, y0, x1, y1) {
		let paths = this.getPathsForPiece(x0, y0);
		if (!paths) return;

		return paths.filter(path => path[0].x === x1 && path[0].y === y1)[0][0];
	}

	getNormalizedPaths() {
		let paths = [];

		this.currentPaths.forEach(piece => {
			piece.paths.forEach(path => {
				paths.push([piece.piece, ...path]);
			})
		})
		return paths;
	}

	makeRandomMove() {
		let moves = this.getNormalizedPaths();
		let rnd = Math.floor(Math.random() * moves.length);
		let pick = moves[rnd];

		const { x: x0, y: y0 } = pick[0];
		const { x: x1, y: y1 } = pick[1];

		this.move(x0, y0, x1, y1);
	}

	playRandomGame() {
		setTimeout(() => {
			this.makeRandomMove();
			if (!this.gameEnd) this.playRandomGame();
		}, 1000);
	}

	isValidMove(x0, y0, x1, y1) {
		let nextMoves = this.getNextMovesForPiece(x0, y0);
		if (!nextMoves) return false;

		return !!nextMoves.find(move => move.x === x1 && move.y === y1);
	}

	isPieceSelectable(x, y) {
		return !!this.getPathsForPiece(x, y);
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

		const foundMove = this.getMovePath(x0, y0, x1, y1);
		const capture = foundMove.captured;

		this.gameBoard.makeMove(x0, y0, x1, y1, capture);
		this.updateSelection(x1, y1);

		const isHit = foundMove.captured != null;
		this.updateGrid(x0, y0, x1, y1, capture);

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

	updateGrid(x0, y0, x1, y1, capture) {
		this.checkerBoard.movePiece(x0, y0, x1, y1);
		if (capture != null) {
			this.checkerBoard.capturePiece({x: capture.x, y: capture.y});
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

export default Checkers;