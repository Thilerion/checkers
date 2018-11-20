const PLAYER_WHITE = 'white';
const PLAYER_WHITE_MULT = 1;
const PLAYER_BLACK = 'black';
const PLAYER_BLACK_MULT = -1;

const PIECE_MAN = 1;
const PIECE_KING = 2;

const EMPTY_CELL = " ";

const SQUARE_TYPES = {
	white: 'whiteSquare',
	black: 'blackSquare'
}

const RULES = {
	size: 10,
	firstMove: PLAYER_WHITE,
	captureBack: true,
	flyingKings: true
}

const PIECES = {
	manWhite: PLAYER_WHITE_MULT * PIECE_MAN,
	manBlack: PLAYER_BLACK_MULT * PIECE_MAN,
	kingWhite: PLAYER_WHITE_MULT * PIECE_KING,
	kingBlack: PLAYER_BLACK_MULT * PIECE_KING
};

RULES.size = 8;

export { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, PIECES, EMPTY_CELL, SQUARE_TYPES };