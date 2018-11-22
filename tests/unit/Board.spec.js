import { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, NO_PIECE, PIECES, SQUARE_TYPES } from '../../src/utils/constants.js';

import { Board } from '../../src/utils/game.js';

describe('Board creation', () => {
	describe('initial properties', () => {	
		let b;		
		beforeEach(() => {
			b = new Board(10);
		})

		it('accepts a size parameter', () => {
			expect(b).toHaveProperty('size', 10);
			expect(new Board(20)).toHaveProperty('size', 20);
		})

		it('has empty board and history arrays', () => {
			expect(b).toHaveProperty('board');
			expect(b.board).toHaveLength(0);
			expect(b).toHaveProperty('history');
			expect(b.history).toHaveLength(0);
		})

		describe('piecesLeft property', () => {
			it('has a piecesLeft property', () => {
				expect(b).toHaveProperty('piecesLeft');
			})

			it('piecesLeft has a property for both players', () => {
				const piecesLeftProps = Object.keys(b.piecesLeft);
				expect(piecesLeftProps).toHaveLength(2);
				expect(piecesLeftProps.includes(PLAYER_BLACK)).toBe(true);
				expect(piecesLeftProps.includes(PLAYER_WHITE)).toBe(true);
			})
		})
	})

	describe('static methods', () => {
		describe('copy', () => {
			it('returns a new Board with the same board array and size', () => {
				let b = new Board(2).createBoard();
				b.board = [[1, 2], [3, 4]];
				let copied = Board.copy(b);

				expect(b).not.toBe(copied);
				expect(b.size).toBe(copied.size);
				expect(b.board).toEqual(copied.board);
				expect(b.board).not.toBe(copied.board);
			})

			it('keeps values in the piecesLeft object', () => {
				let b = new Board(10);
				b.piecesLeft = { a: 10, b: 20 };
				let copied = Board.copy(b);

				expect(b.piecesLeft).toEqual(copied.piecesLeft);
				expect(b.piecesLeft).not.toBe(copied.piecesLeft);
			})

			it('does not keep the history if not specified as parameter', () => {
				let b = new Board(10);
				b.history = [{ x: 1, y: 2, captured: { x: 3, y: 4 } }];

				let copied = Board.copy(b);
				expect(copied.history).not.toEqual(b.history);

				copied = Board.copy(b, true);
				expect(copied.history).toEqual(b.history);
			})
		})
	})

	describe('createBoard method', () => {
		it('creates and sets a 2d array as board property', () => {
			const size = 10;
			let b = new Board(size);

			expect(b.board).toHaveLength(0);
			b.createBoard();
			expect(b.board).toHaveLength(size);
			expect(b.board[0]).toHaveLength(size);
		})

		it('returns itself', () => {
			let b = new Board(10);
			expect(b).toBe(b.createBoard());
		})
	})

	describe('addInitialPieces method', () => {
		let b6 = new Board(6).createBoard().addInitialPieces();
		let b10 = new Board(10).createBoard().addInitialPieces();

		it('leaves the two center rows empty', () => {
			expect(b6.board[2]).toEqual(b6.board[3]);
			expect(b6.board[1]).not.toEqual(b6.board[3]);
			expect(b6.board[2].includes(PIECES.manBlack)).toBe(false);
			expect(b6.board[2].includes(PIECES.manWhite)).toBe(false);

			expect(b10.board[4]).toEqual(b10.board[5]);
			expect(b10.board[4]).not.toEqual(b10.board[3]);
		})

		it('adds black man pieces to top rows, white man pieces to bottom rows', () => {
			expect(b6.board[0].includes(PIECES.manBlack)).toBe(true);
			expect(b6.board[0].includes(PIECES.manWhite)).toBe(false);

			expect(b6.board[5].includes(PIECES.manBlack)).toBe(false);
			expect(b6.board[5].includes(PIECES.manWhite)).toBe(true);
		})

		it('alternates adding a piece at the 1st and then 2nd column', () => {
			expect(b6.board[0][0]).toBe(NO_PIECE);
			expect(b6.board[0][1]).toBe(PIECES.manBlack);
			expect(b6.board[1][0]).toBe(PIECES.manBlack);
			expect(b6.board[1][1]).toBe(NO_PIECE);

			expect(b10.board[9][9]).toBe(NO_PIECE);
			expect(b10.board[9][8]).toBe(PIECES.manWhite);
		})

		it('sets the piecesAmount after adding pieces', () => {
			let board = new Board(10);
			let amountBefore = { ...board.piecesLeft };
			let amountAfter = { ...board.createBoard().addInitialPieces().piecesLeft };
			
			expect(amountBefore).not.toEqual(amountAfter);
		})
	})

	describe('updatePiecesAmount method', () => {
		it('updates the piecesLeft property correctly', () => {
			let b1 = new Board(8).createBoard().updatePiecesAmount();
			expect(b1.piecesLeft[PLAYER_BLACK]).toBe(0);
			expect(b1.piecesLeft[PLAYER_WHITE]).toBe(0);

			b1.board = [
				[PIECES.manBlack, NO_PIECE, PIECES.manBlack, NO_PIECE],
				[NO_PIECE, PIECES.manWhite, NO_PIECE, PIECES.kingBlack, PIECES.kingBlack]
			];

			b1.updatePiecesAmount();
			expect(b1.piecesLeft[PLAYER_BLACK]).toBe(4);
			expect(b1.piecesLeft[PLAYER_WHITE]).toBe(1);
		})
	})

	describe('set and remove piece methods', () => {

		describe('setPiece', () => {
			it('places a piece on the board', () => {
				let b = new Board(6).createBoard();
				expect(b.board[1][1]).toBe(NO_PIECE);
	
				b.setPiece(1, 1, PIECES.manWhite);
				expect(b.board[1][1]).toBe(PIECES.manWhite);
			})
		})

		describe('removePiece', () => {
			it('removes a piece from the board and returns it', () => {
				let b = new Board(6).createBoard();
				b.board[1][1] = PIECES.manWhite;
	
				expect(b.board[1][1]).toBe(PIECES.manWhite);
				expect(b.removePiece(1, 1)).toBe(PIECES.manWhite);
				expect(b.board[1][1]).toBe(NO_PIECE);
			})
		})

		it('both set a new piecesAmount', () => {
			let b = new Board(6).createBoard();
			let amountBase = { ...b.piecesLeft };
			b.setPiece(1, 1, PIECES.manBlack).setPiece(2, 2, PIECES.manWhite);
			let amountAdded = { ...b.piecesLeft };
			b.removePiece(1, 1);
			let amountAfter = { ...b.piecesLeft };

			expect(amountBase).not.toEqual(amountAdded);
			expect(amountBase).not.toEqual(amountAfter);
			expect(amountAdded).not.toEqual(amountAfter);
		})
	})

	describe('isKing method', () => {
		it('returns true when a piece is a king', () => {
			let b = new Board(6).createBoard();
			b.board[0][0] = PIECES.kingBlack;
			b.board[1][2] = PIECES.manBlack;
			b.board[2][3] = PIECES.kingWhite;

			expect(b.isKing(0, 0)).toBe(true);
			expect(b.isKing(2, 1)).toBe(false);
			expect(b.isKing(3, 2)).toBe(true);
		})
	})
})