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
	autoDrawAfterNoCaptures: 50
}

const PIECES = {
	manWhite: PLAYER_WHITE_MULT * PIECE_MAN,
	manBlack: PLAYER_BLACK_MULT * PIECE_MAN,
	kingWhite: PLAYER_WHITE_MULT * PIECE_KING,
	kingBlack: PLAYER_BLACK_MULT * PIECE_KING
};

export const GET_PIECE_ID = (type, player) => {
	let mult = player === PLAYER_BLACK ? PLAYER_BLACK_MULT : PLAYER_WHITE_MULT;
	return type * mult;
}

export const GET_PIECE_PLAYER = pieceId => {
	if (pieceId === PIECES.manWhite || pieceId === PIECES.kingWhite) {
		return PLAYER_WHITE;
	} else if (pieceId === PIECES.manBlack || pieceId === PIECES.kingBlack) {
		return PLAYER_BLACK;
	}
	else return null;
}

export const GET_PIECE_TYPE = pieceId => {
	if (pieceId === PIECES.manWhite || pieceId === PIECES.manBlack) {
		return PIECE_MAN;
	} else if (pieceId === PIECES.kingWhite || pieceId === PIECES.kingBlack) {
		return PIECE_KING;
	}
	else return null;
}

export const IS_PIECE_TYPE_KING = type => type > 1;

export const GET_PIECE_STRING = pieceId => {
	let base = GET_PIECE_PLAYER(pieceId) === PLAYER_BLACK ? "b" : "w";
	return GET_PIECE_TYPE(pieceId) === PIECE_KING ? base.toUpperCase() : base;
}

RULES.size = 8;

export { TIE, PLAYER_BLACK, PLAYER_WHITE, RULES, PIECE_KING, PIECE_MAN, PIECES, NO_PIECE, SQUARE_TYPES };