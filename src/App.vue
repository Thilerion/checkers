<template>
	<div id="app">
		<div class="board">
			<div class="row" v-for="row in size" :key="row">
				<div class="cell" :class="getCellTypeClass(row, col)" v-for="col in size" :key="col">
					<div class="piece piece-white" v-if="hasWhitePiece(row, col)"></div>
					<div class="piece piece-black" v-else-if="hasBlackPiece(row, col)"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {Checkers, Board} from './utils/game.js';
import {PIECES, CELL_TYPES} from './utils/constants.js';

export default {
	name: "app",
	components: {

	},
	data() {
		return {
			game: new Checkers()
		}
	},
	computed: {
		board() {
			return this.game.board.grid;
		},
		size() {
			return this.game.size;
		}
	},
	methods: {
		getPieceAt(row, col) {
			let index = this.game.board.coordsToIndex(col - 1, row - 1);
			return this.board[index];
		},
		hasWhitePiece(row, col) {
			return this.getPieceAt(row, col) === PIECES.manWhite;
		},
		hasBlackPiece(row, col) {
			return this.getPieceAt(row, col) === PIECES.manBlack;
		},
		getCellType(row, col) {
			return this.game.board.getCellType(row - 1, col - 1);
		},
		getCellTypeClass(row, col) {
			if (this.getCellType(row, col) === CELL_TYPES.black) return 'cell-black';
			else return 'cell-white';
		}
	}
};
</script>

<style>
.board {
	display: flex;
	flex-direction: column;
}

.row {
	display: flex;
	flex-direction: row;
}

.cell {
	width: 50px;
	height: 50px;
	margin: 1px;
	display: flex;
}

.cell-black {
	background: rgb(131, 101, 76);
}

.cell-white {
	background: rgb(218, 206, 175);
}

.piece {
	width: 70%;
	height: 70%;
	border-radius: 50%;
	margin: auto;
}

.piece-black {
	background: black;
}

.piece-white {
	background: white;
}
</style>
