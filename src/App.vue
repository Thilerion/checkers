<template>
	<div id="app">
		<div class="board">
			<div class="row" v-for="(row, rowN) in board" :key="rowN">
				<SquareComponent v-for="square in row" :key="`${square.x},${square.y}`" :color="square.squareColor">
					<PieceComponent @click.native="clickPiece(square.x, square.y)" :piece="pieceAt(square.x, square.y)" />
				</SquareComponent>
			</div>
		</div>
	</div>
</template>

<script>
import {Checkers, Board} from './utils/game.js';
import {PIECES, SQUARE_TYPES} from './utils/constants.js';

import SquareComponent from './components/Square.vue';
import PieceComponent from './components/Piece.vue';

export default {
	name: "app",
	components: {
		SquareComponent,
		PieceComponent
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
		},
		pieces() {
			return this.game.board.pieces;
		}
	},
	methods: {
		pieceAt(x, y) {
			return this.pieces.find(p => p.x === x && p.y === y && p.alive);
		},
		clickPiece(x, y) {
			console.log(this.game.board.getValidMovesFor(x, y));
		}
	},
	mounted() {
		this.game.board.import('bbbb-bbbb-b00b-0bb0-w0w0-w0w0-wwww-wwww');
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
</style>
