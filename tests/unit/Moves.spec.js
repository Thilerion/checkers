import Moves from '../../src/utils/Moves.js';
import {PLAYER_BLACK, PLAYER_WHITE} from '../../src/utils/constants.js';

const emptyBoard = [
	[0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0]
];

describe('finds valid moves for boards', () => {
	let M;
	let validMoves;
	beforeEach(() => {
		M = new Moves({size: 6, captureBack: true, flyingKings: true});
		validMoves = null;
	})

	it('finds valid moves for kings', () => {
		validMoves = M.findValidMoves([
			[0, -2, 0, 0, 0, 0],
			[1, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0]
		], PLAYER_BLACK);

		expect(validMoves).toHaveLength(0);

		validMoves = M.findValidMoves([
			[0, -2, 0, 0, 0, 0],
			[0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0]
		], PLAYER_BLACK);

		expect(validMoves).toHaveLength(1);

		validMoves = M.findValidMoves([
			[0, -2, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0]
		], PLAYER_BLACK);

		expect(validMoves).toHaveLength(1);
		expect(validMoves[0].moves).toHaveLength(2);
		expect(validMoves[0].moves[0]).toHaveLength(1);

		validMoves = M.findValidMoves([
			[0, -2, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0]
		], PLAYER_BLACK);

		expect(validMoves).toHaveLength(1);
		expect(validMoves[0].moves).toHaveLength(1);
		expect(validMoves[0].moves[0]).toHaveLength(2);
	})
})