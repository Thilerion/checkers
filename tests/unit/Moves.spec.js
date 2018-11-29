import Moves from '../../src/utils/Moves.js';
import {PLAYER_BLACK, PLAYER_WHITE} from '../../src/utils/constants.js';

function createBoard(pieces) {
	let arr = Array(8).fill(0).map(row => {
		return Array(8).fill(0);
	});

	pieces.forEach(([x, y, type]) => {
		arr[y][x] = type;
	})

	return arr;
}

describe('valid moves for board setups', () => {
	let M;
	let board;
	let validMoves;
	beforeEach(() => {
		M = new Moves({size: 8, captureBack: true, flyingKings: true});
		board = null;
		validMoves = null;
	})
	
	describe('valid moves for simple pieces', () => {
		it('returns correct forward moves', () => {
			board = createBoard([
				[0, 7, 1],
				[2, 7, 1],
				[4, 7, 1],
				[6, 7, 1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(4);
			expect(M.movesForPiece(0, 7)).toHaveLength(1);
			expect(M.movesForPiece(2, 7)).toHaveLength(2);
		})

		it('only returns forward moves', () => {
			board = createBoard([
				[1, 6, 1],
				[2, 1, -1]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(1, 6)).toHaveLength(2);

			M.findValidMoves(board, PLAYER_BLACK);
			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(2, 1)).toHaveLength(2);
		})

		it('does not return moves blocked by own piece', () => {
			board = createBoard([
				[2, 7, 1],
				[1, 6, 1],
				[3, 6, 1]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			expect(M.movesForPiece(2, 7)).toHaveLength(0);
		})

		it('does not return moves blocked by enemy pieces', () => {
			board = createBoard([
				[2, 7, 1],
				[1, 6, -1],
				[3, 6, -1],
				[0, 5, -1],
				[4, 5, -1]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			expect(M.movesForPiece(2, 7)).toHaveLength(0);
		})
	})

	describe('valid moves for kings', () => {
		it('finds moves in all directions', () => {
			board = createBoard([
				[1, 6, 2]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			// NW: 1, SW: 1, SE: 1, NE: 6
			expect(M.movesForPiece(1, 6)).toHaveLength(9);
		})

		it('does not return blocked moves', () => {
			board = createBoard([
				[1, 6, 2],
				[4, 3, -1],
				[5, 2, -1]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			// NW: 1, SW: 1, SE: 1, NE: 2
			expect(M.movesForPiece(1, 6)).toHaveLength(5);
		})

		it('has no moves if blocked on all sides', () => {
			board = createBoard([
				[3, 4, 2],
				[2, 5, 1],
				[2, 3, 1],
				[4, 3, 1],
				[4, 5, 1]
			]);

			M.findValidMoves(board, PLAYER_WHITE);
			expect(M.movesForPiece(3, 4)).toHaveLength(0);
		})
	})

	describe('valid single hits for simple pieces', () => {
		it('returns a simple one-piece capture', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(1);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
		})

		it('returns multiple one-piece captures', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1],
				[2, 3, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(2);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
			expect(M.isValidCapture(3, 4, 2, 3)).toBe(true);
		})

		it('can not capture own pieces', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1],
				[2, 3, 1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(1);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
			expect(M.isValidCapture(3, 4, 2, 3)).toBe(false);
		})
	})

	describe('valid multiple hits for simple pieces', () => {
		it('returns a simple two-piece capture', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1],
				[6, 1, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(1);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
			expect(M.isValidCapture(3, 4, 6, 1)).toBe(true);
		})

		it('returns multiple two-piece captures', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1],
				[6, 1, -1],
				[4, 5, -1],
				[6, 5, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(2);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
			expect(M.isValidCapture(3, 4, 6, 1)).toBe(true);
			expect(M.isValidCapture(3, 4, 4, 5)).toBe(true);
			expect(M.isValidCapture(3, 4, 6, 5)).toBe(true);

			expect(M.getPiecePathsWithVisitedSquare(3, 4, 5, 2)).toHaveLength(1);
			expect(M.getPiecePathsWithVisitedSquare(3, 4, 5, 6)).toHaveLength(1);
		})

		it('returns only path with most captures', () => {
			board = createBoard([
				[3, 4, 1],
				[4, 3, -1],
				[6, 1, -1],
				[4, 5, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.movesForPiece(3, 4)).toHaveLength(1);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
			expect(M.isValidCapture(3, 4, 6, 1)).toBe(true);
			expect(M.isValidCapture(3, 4, 4, 5)).toBe(false);
		})
	})

	describe('valid single hits for kings', () => {
		it('returns a simple one-piece capture', () => {
			board = createBoard([
				[3, 4, 2],
				[4, 3, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.getAmountMoveablePieces()).toBe(1);
			expect(M.isValidCapture(3, 4, 4, 3)).toBe(true);
		})

		it('allows for ending up at any square beyond the captured piece', () => {
			board = createBoard([
				[3, 4, 2],
				[4, 3, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.movesForPiece(3, 4)).toHaveLength(3);
		})

		it('cannot hit pieces without empty square right after', () => {
			board = createBoard([
				[3, 4, 2],
				[5, 2, -1],
				[6, 1, -1],
				[4, 5, -1],
				[5, 6, -1]
			]);
			M.findValidMoves(board, PLAYER_WHITE);

			expect(M.isValidCapture(3, 4, 5, 2)).toBe(false);
			expect(M.isValidCapture(3, 4, 6, 1)).toBe(false);
			expect(M.isValidCapture(3, 4, 4, 5)).toBe(false);
			expect(M.isValidCapture(3, 4, 5, 6)).toBe(false);
		})
	})
})