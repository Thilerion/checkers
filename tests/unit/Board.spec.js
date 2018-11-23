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

	describe('getPiecePlayer method', () => {
		it('returns the to which player the piece belongs to', () => {
			let b = new Board(6).createBoard();
			expect(b.getPiecePlayer(PIECES.manBlack)).toBe(PLAYER_BLACK);
			expect(b.getPiecePlayer(PIECES.manWhite)).toBe(PLAYER_WHITE);
			expect(b.getPiecePlayer(PIECES.kingWhite)).toBe(PLAYER_WHITE);
		})
	})

	describe('isValidSquare method', () => {
		let b = new Board(6).createBoard();

		it('returns false when coords are out of the board', () => {
			expect(b.isValidSquare(-1, 0)).toBe(false);	
			expect(b.isValidSquare(1, -1)).toBe(false);	
			expect(b.isValidSquare(6, 5)).toBe(false);	
			expect(b.isValidSquare(3, 6)).toBe(false);	
		})

		it('returns false when coord belongs to white square', () => {
			expect(b.isValidSquare(0, 0)).toBe(false);
			expect(b.isValidSquare(2, 4)).toBe(false);
		})

		it('returns true when coord is on board and black square', () => {
			expect(b.isValidSquare(1, 0)).toBe(true);
			expect(b.isValidSquare(4, 5)).toBe(true);
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

	describe('checkCrown method', () => {
		let b = new Board(8).createBoard();
		beforeEach(() => {
			b = new Board(8).createBoard();
		})

		it('returns false when piece already is king', () => {
			b.setPiece(1, 0, -2);
			expect(b.checkCrown(1, 0)).toBe(false);
		})

		it('returns true when piece is on opponent\'s side of board', () => {
			b.setPiece(3, 0, 1).setPiece(0, 7, -1);
			expect(b.checkCrown(3, 0)).toBe(true);
			expect(b.checkCrown(0, 7)).toBe(true);
		})

		it('returns false when own piece on edge of board', () => {
			b.setPiece(3, 0, -1).setPiece(0, 7, 1);
			expect(b.checkCrown(3, 0)).toBe(false);
			expect(b.checkCrown(0, 7)).toBe(false);
		})

		it('returns false otherwise', () => {
			expect(b.checkCrown(2, 3)).toBe(false);
			b.setPiece(4, 3, 1);
			expect(b.checkCrown(4, 3)).toBe(false);
		})
	})

	describe('crownPiece method', () => {
		it('replaces a man with a king', () => {
			let b = new Board(8).createBoard().addInitialPieces();
			expect(b.getPieceAt(1, 0)).toBe(PIECES.manBlack);
			b.crownPiece(1, 0, PIECES.manBlack);
			expect(b.getPieceAt(1, 0)).toBe(PIECES.kingBlack);
		})
	})

	describe('checking correct pieces and hits for a piece', () => {
		let b;

		describe('getting correct moves for a man piece', () => {
			beforeEach(() => {
				b = new Board(6).createBoard();
			})

			it('returns 2 forward moves for a single piece in the center', () => {
				b.setPiece(2, 3, PIECES.manBlack);
				let moves = b.getPieceMoves(2, 3);				
				let expectedMoves = [{ x: 1, y: 4 }, { x: 3, y: 4 }];

				expect(moves).toContainEqual(expectedMoves[0]);
				expect(moves).toContainEqual(expectedMoves[1]);
				expect(moves).toHaveLength(2);
			})

			it('returns less moves when spots are taken by other pieces', () => {
				b.setPiece(2, 3, PIECES.manBlack).setPiece(1, 2, PIECES.manBlack).setPiece(3, 2, PIECES.manBlack);
				expect(b.getPieceMoves(3, 2)).toHaveLength(1);
			})

			it('returns less moves when spots are outside of board', () => {
				b.setPiece(0, 3, PIECES.manWhite);
				expect(b.getPieceMoves(0, 3)).toHaveLength(1);
			})
		})

		describe('getting correct moves for a king piece', () => {
			beforeEach(() => {
				b = new Board(6).createBoard();
			})

			it('returns moves in all 4 diagonals', () => {
				b.setPiece(2, 3, 2);
				let moves = b.getPieceMoves(2, 3);

				expect(moves).toContainEqual({ x: 1, y: 2 });
				expect(moves).toContainEqual({ x: 3, y: 2 });
				expect(moves).toContainEqual({ x: 1, y: 4 });
				expect(moves).toContainEqual({ x: 3, y: 4 });
			})

			it('returns all moves in a diagonal', () => {
				b.setPiece(2, 5, 2);
				let moves = b.getPieceMoves(2, 5);

				expect(moves).toHaveLength(5);
				expect(moves).toContainEqual({ x: 5, y: 2 });
				expect(moves).toContainEqual({ x: 0, y: 3 });
			})

			it('does not return moves beyond inhabited squares', () => {
				b.setPiece(5, 4, 2).setPiece(2, 1, 1);
				let moves = b.getPieceMoves(5, 4);

				expect(moves).toContainEqual({ x: 3, y: 2 });
				expect(moves).not.toContainEqual({ x: 1, y: 0 });
			})
		})

		describe('getting correct hits for a man piece', () => {
			beforeEach(() => {
				b = new Board(6).createBoard();
			})

			it('returns hits for every piece it can hit', () => {
				b.setPiece(2, 3, 1).setPiece(1, 2, -1).setPiece(3, 2, -1);
				let hits = b.getPieceHits(2, 3);

				expect(hits).toHaveLength(2);
			})

			it('does not return hits for own pieces', () => {
				b.setPiece(2, 3, 1).setPiece(1, 2, -1).setPiece(3, 2, 1);
				let hits = b.getPieceHits(2, 3);

				expect(hits).toHaveLength(1);
			})

			it('returns backwards hits as well', () => {
				b.setPiece(2, 3, 1).setPiece(1, 4, -1);
				let hits = b.getPieceHits(2, 3);

				expect(hits).toHaveLength(1);
			})

			it('returns next coordinates, and a captured object with the coordinates of the piece that was hit', () => {
				b.setPiece(2, 3, 1).setPiece(3, 2, -1);
				let hits = b.getPieceHits(2, 3);
				let expectedHit = { x: 4, y: 1, captured: { x: 3, y: 2 } };

				expect(hits).toContainEqual(expectedHit);
			})
		})

		describe('getting correct hits for a king piece', () => {
			beforeEach(() => {
				b = new Board(6).createBoard();
			})

			it('captures a piece in the same way a man piece can', () => {
				b.setPiece(2, 5, 2).setPiece(3, 4, -1);
				let hits = b.getPieceHits(2, 5);
				let expectedHit = { x: 4, y: 3, captured: { x: 3, y: 4 } };

				expect(hits).toContainEqual(expectedHit);
			})

			it('can capture a piece more than 1 square away', () => {
				b.setPiece(2, 5, 2).setPiece(4, 3, -1);
				let hits = b.getPieceHits(2, 5);
				let expectedHit = { x: 5, y: 2, captured: { x: 4, y: 3 } };

				expect(hits).toContainEqual(expectedHit);
			})

			it('returns hits with all valid squares behind the piece that was captured', () => {
				b.setPiece(2, 5, 2).setPiece(3, 4, -1);
				let hits = b.getPieceHits(2, 5);
				let expectedMoves = hits.filter(hit => {
					return hit.captured.x === 3 && hit.captured.y === 4;
				});

				expect(expectedMoves).toHaveLength(2);
			})
		})

		describe('getting combined move or hit options for a piece', () => {
			beforeEach(() => {
				b = new Board(8).createBoard().setPiece(3, 4, 1);
			})

			describe('piece moves', () => {
				it('returns as many moves as the getPieceMoves method does', () => {
					expect(b.getPieceMoves(3, 4).length).toBe(b.getPieceOptions(3, 4).length);

					b.removePiece(3, 4);
					b.setPiece(3, 4, 2);
					expect(b.getPieceMoves(3, 4).length).toBe(b.getPieceOptions(3, 4).length);
				})

				it('returns path arrays instead of move objects, with path of length 1 for moves', () => {
					let path = b.getPieceOptions(3, 4);

					expect(path[0]).toHaveLength(1);
				})

				it('adds a capture property with value null for moves', () => {
					let path = b.getPieceOptions(3, 4);

					expect(path[0][0].captured).toBe(null);
				})
			})

			describe('piece hits', () => {
				it('returns only hits when at least one hit is possible', () => {
					b.setPiece(4, 3, -1);

					expect(b.getPieceOptions(3, 4)).toHaveLength(1);
				})

				it('returns a single path for two subsequent possible hits', () => {
					b.setPiece(4, 3, -1);
					b.setPiece(6, 1, -1);

					expect(b.getPieceOptions(3, 4)).toHaveLength(1);
				})

				it('returns paths containing all hits possible in that path', () => {
					b.setPiece(4, 3, -1);
					b.setPiece(6, 1, -1);

					expect(b.getPieceOptions(3, 4)[0]).toHaveLength(2);
				})

				it('returns multiple paths when the multiple initial hits are possible', () => {
					b.setPiece(4, 3, -1).setPiece(2, 3, -1).setPiece(6, 1, -1);

					expect(b.getPieceOptions(3, 4)).toHaveLength(2);
				})

				it('returns a path for each time multiple options are possible', () => {
					b.setPiece(4, 3, -1).setPiece(4, 1, -1).setPiece(6, 3, -1);
					const options = b.getPieceOptions(3, 4);

					expect(options).toHaveLength(2);
					
					options.forEach(option => {
						expect(option).toHaveLength(2);
					})
				})

				it('creates a path for every hit a king can make for every final landing spot that is available', () => {
					b.setPiece(0, 7, -2).setPiece(5, 4, 1).setPiece(6, 3, 1);
					const options = b.getPieceOptions(0, 7);

					expect(options).toHaveLength(5);
				})

				it('returns a captured property for every hit', () => {
					b.setPiece(4, 3, -1);

					expect(b.getPieceOptions(3, 4)[0][0]).toHaveProperty('captured');
				})

				it('can handle hitting two ways in a loop', () => {
					b.setPiece(4, 3, -1).setPiece(2, 3, -1).setPiece(2, 1, -1).setPiece(4, 1, -1);
					const options = b.getPieceOptions(3, 4);

					expect(options).toHaveLength(2);
					
					options.forEach(option => {
						expect(option).toHaveLength(4);
						expect(option[3].x).toBe(3);
						expect(option[3].y).toBe(4);
					})
				})
			})

			it('does not alter the original Board object', () => {
				b.setPiece(4, 3, -1);
				let historyBefore = JSON.parse(JSON.stringify(b.history));
				let piecesLeftBefore = JSON.parse(JSON.stringify(b.piecesLeft));
				b.getPieceOptions(3, 4);
				expect(b.history).toEqual(historyBefore);
				expect(b.piecesLeft).toEqual(piecesLeftBefore);
			})
		})

		describe('getting all options from all pieces', () => {
			beforeEach(() => {
				b = new Board(8).createBoard();
			})

			it('returns an array with items for each piece that has options', () => {
				b.addInitialPieces();

				expect(b.getAllPieceOptions(PLAYER_WHITE)).toHaveLength(4);
				expect(b.getAllPieceOptions(PLAYER_BLACK)).toHaveLength(4);
			})

			it('has an array with objects containing the coordinates for the piece', () => {
				b.setPiece(0, 7, 1);

				expect(b.getAllPieceOptions(PLAYER_WHITE)[0].piece).toEqual({ x: 0, y: 7 });
			})
		})
	})
})