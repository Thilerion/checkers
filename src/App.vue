<template>
	<div id="app">
		<div class="board">
			<div class="row" v-for="(row, rowN) in grid" :key="rowN">
				<SquareComponent v-for="square in row" :key="`${square.x},${square.y}`" :color="square.squareColor">
					<!-- <div> -->
						<span class="square-coords">{{square.x}},{{square.y}}</span>
						<PieceComponent @click.native="clickPiece(square.x, square.y)" :piece="board[square.y][square.x]" />
					<!-- </div> -->
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
import { setTimeout } from 'timers';

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
		},
		pieces() {
			return this.game.pieces;
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
		// this.game.board.import('0b0b-bbbb-b000-0bbb-w0w0-w0w0-wwww-wwww');
		this.game.gameBoard.makeMove(1, 2, 2, 3).makeMove(4, 5, 3, 4)
		console.log({ moves: this.game.gameBoard.getPossibleMoves(2, 3)});
		console.log({ hits: this.game.gameBoard.getPossibleHits(2, 3)});
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
</style>
