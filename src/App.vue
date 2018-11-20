<template>
	<div id="app">
		<div class="board">
			<div
				class="row"
				v-for="(row, rowN) in grid"
				:key="rowN"
			>
				<SquareComponent
					v-for="square in row"
					:key="`${square.x},${square.y}`"
					:color="square.squareColor"
				>
					<span class="square-coords" :class="{'selected': square.x === selectedPiece.x && square.y === selectedPiece.y}">{{square.x}},{{square.y}}</span>

					<PieceComponent
						@click.native="selectPiece(square.x, square.y)"
						:piece="board[square.y][square.x]" />
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
			game: new Checkers(),
			selectedPiece: {x: null, y: null}
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
		},
		pieces() {
			return this.game.pieces;
		}
	},
	methods: {
		selectPiece(x, y) {
			this.selectedPiece = {x, y};
		}
	},
	mounted() {
		// this.game.board.import('0b0b-bbbb-b000-0bbb-w0w0-w0w0-wwww-wwww');
		let allHits = this.game.gameBoard.getAllHitsOrMoves(this.game.currentPlayer);
		console.log(allHits);
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

.square-coords {
	position: absolute;
	color: black;
	background: rgb(255, 206, 206);
	opacity: 0.7;
	font-size: 12px;
}

.square-coords.selected {
	border: 0px solid blue;
	border-bottom-width: 3px;
	border-right-width: 3px;
}
</style>
