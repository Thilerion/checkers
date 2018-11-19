const PLAYER_WHITE = 1;
const PLAYER_BLACK = -1;

const PIECE_MAN = 1;
const PIECE_KING = 2;

const EMPTY_CELL = " ";

const RULES = {
	size: 10,
	firstMove: PLAYER_WHITE,
	captureBack: true,
	flyingKings: true
}

const PIECES = {
	manWhite: PLAYER_WHITE * PIECE_MAN,
	manBlack: PLAYER_BLACK * PIECE_MAN,
	kingWhite: PLAYER_WHITE * PIECE_KING,
	kingBlack: PLAYER_BLACK * PIECE_KING
};

RULES.size = 8;

export { PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, PIECES, EMPTY_CELL };