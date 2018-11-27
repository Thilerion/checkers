import { PIECES, PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, PIECE_MAN, GET_PIECE_PLAYER, GET_PIECE_TYPE, IS_PIECE_TYPE_KING, GET_PIECE_STRING, GET_PIECE_ID } from './constants.js';

export default class Piece {
	constructor(x, y, typeId) {
		this.uid = `${x}-${y}`;

		this.x = x;
		this.y = y;

		this.alive = true;

		this.player = GET_PIECE_PLAYER(typeId);
		this.type = GET_PIECE_TYPE(typeId);
		this.typeId = typeId;
	}

	isKing() {
		return IS_PIECE_TYPE_KING(this.type);
	}

	move(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	capture() {
		this.alive = false;
		return this;
	}

	revive() {
		this.alive = true;
		return this;
	}

	toString() {
		return GET_PIECE_STRING(this.typeId);
	}

	crown() {
		if (!this.isKing()) {
			this.typeId = GET_PIECE_ID(PIECE_KING, this.player);
			this.type = PIECE_KING;
		}
		return this;
	}

	decrown() {
		if (this.isKing()) {
			this.typeId = GET_PIECE_ID(PIECE_MAN, this.player);
			this.type = PIECE_MAN;
		}
		return this;
	}
}