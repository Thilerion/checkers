const PLAYER_WHITE = 'white';
const PLAYER_WHITE_MULT = 1;
const PLAYER_BLACK = 'black';
const PLAYER_BLACK_MULT = -1;

const PIECE_MAN = 1;
const PIECE_KING = 2;

const NO_PIECE = 0;
const TIE = 'tie';

const SQUARE_TYPES = {
	white: 'whiteSquare',
	black: 'blackSquare'
}

const RULES = {
	size: 10,
	firstMove: PLAYER_WHITE,
	captureBack: true,
	flyingKings: true,
	automaticDrawAfterMoves: 100
}

const PIECES = {
	manWhite: PLAYER_WHITE_MULT * PIECE_MAN,
	manBlack: PLAYER_BLACK_MULT * PIECE_MAN,
	kingWhite: PLAYER_WHITE_MULT * PIECE_KING,
	kingBlack: PLAYER_BLACK_MULT * PIECE_KING
};

RULES.size = 8;

export { TIE, PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, PIECES, NO_PIECE, SQUARE_TYPES };