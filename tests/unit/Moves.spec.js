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

describe('finds valid moves for boards', () => {
	let M;
	let board;
	let validMoves;
	beforeEach(() => {
		M = new Moves({size: 8, captureBack: true, flyingKings: true});
		board = null;
		validMoves = null;
	})
	
	describe('finds valid moves for simple pieces', () => {
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
})