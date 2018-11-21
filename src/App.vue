<template>
	<div id="app">
		<div class="board">
			<div
				class="row"
				v-for="(row, rowN) in grid"
				:key="rowN"
			>
				<SquareComponent
					@click.native="selectPiece(square.x, square.y)"
					v-for="square in row"
					:key="`${square.x},${square.y}`"
					:square="square"
				>
					<span class="square-coords">{{square.x}},{{square.y}}</span>

					<PieceComponent
						:piece="board[square.y][square.x]" />
				</SquareComponent>
			</div>
		</div>
	</div>
</template>

<script>
import {Checkers, Board} from './utils/game.js';
import {PIECES, SQUARE_TYPES, PLAYER_WHITE} from './utils/constants.js';

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
			return this.game.gameBoard.board;
		},
		grid() {
			return this.game.checkerBoard.grid;
		},
		size() {
			return this.game.size;
		}
	},
	methods: {
		selectPiece(x, y) {
			this.game.select(x, y);
		}
	},
	mounted() {
		// this.game.gameBoard.createBoard().setPiece(3, 4, 1).setPiece(4, 3, -1).setPiece(6, 1, -1).setPiece(4, 1, -1).setPiece(4, 5, -1).setPiece(1, 6, 1).setPiece(2, 1, -1).setPiece(2,3, -1);
		// this.game.initializeTurn();

		this.game.gameBoard.createBoard().setPiece(5, 4, -1).setPiece(2, 1, -1).setPiece(4, 1, -1).setPiece(6, 1, -1).setPiece(2, 3, 1).setPiece(1, 4, -1).setPiece(1, 6, -1).setPiece(3, 4, -1).setPiece(5, 6, -1);
		this.game.initializeTurn();
	}
};
</script>

<style>
.board {
	display: flex;
	flex-direction: column;
	user-select: none;
}

.row {
	display: flex;
	flex-direction: row;
}

.square-coords {
	position: absolute;
	color: black;
	background: rgb(255, 206, 206);
	opacity: 0.7;
	font-size: 12px;
}


</style>
