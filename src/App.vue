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
					:square="square"
					:selected="!!selected && selected.x === square.x && selected.y === square.y"
					:canBeHit="availableHits.find(h => h.x === square.x && h.y === square.y)"
					:canBeMovedTo="availableSquaresForMove.find(h => h.x === square.x && h.y === square.y)"
					@click.native="select(square.x, square.y)"
				>
					<span class="square-coords">{{square.x}},{{square.y}}</span>

					<PieceComponent
						v-if="square.piece && square.piece.alive"
						:piece="square.piece" />
				</SquareComponent>
			</div>
		</div>
		<div class="gameState">
			<div v-if="!winner" class="playing">
				<p>Current player: {{currentPlayer}}</p>
				<h2>Pieces Left</h2>
				<p>White: {{whitePiecesLeft}}</p>
				<p>Black: {{blackPiecesLeft}}</p>
			</div>
			<div v-else class="game-end">
				<p>{{winner}} player has won!</p>
			</div>
		</div>
	</div>
</template>

<script>
import {Checkers} from './utils/game.js';
import {PIECES, SQUARE_TYPES, PLAYER_WHITE, PLAYER_BLACK} from './utils/constants.js';

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
		},
		selected() {
			return this.game.selected;
		},
		pathsForSelection() {
			if (!this.selected) return [];
			return this.game.getPathsForPiece(this.selected.x, this.selected.y);
		},
		availableSquaresForMove() {
			return this.pathsForSelection.reduce((squares, path) => {
				squares.push(...path);
				return squares;
			}, []);
		},
		availableHits() {
			return this.availableSquaresForMove.reduce((hits, square) => {
				if (square.captured) {
					hits.push(square.captured);
				}
				return hits;
			}, []);
		},
		whitePiecesLeft() {
			return this.game.gameBoard.piecesLeft[PLAYER_WHITE];
		},
		blackPiecesLeft() {
			return this.game.gameBoard.piecesLeft[PLAYER_BLACK];
		},
		currentPlayer() {
			return this.game.currentPlayer === PLAYER_BLACK ? "Black" : "White";
		},
		winner() {
			if (!this.game.gameEnd) return;

			return `${this.game.winner.charAt(0).toUpperCase()}${this.game.winner.slice(1)}`;
		}
	},
	methods: {
		select(x, y) {
			this.game.select(x, y);
		}
	},
	mounted() {
		// this.game.gameBoard.createBoard().setPiece(3, 4, 1).setPiece(4, 3, -1).setPiece(6, 1, -1).setPiece(4, 1, -1).setPiece(4, 5, -1).setPiece(1, 6, 1).setPiece(2, 1, -1).setPiece(2,3, -1);
		// this.game.initializeTurn();

		// this.game.gameBoard.createBoard().setPiece(5, 4, -1).setPiece(2, 1, -1).setPiece(4, 1, -1).setPiece(6, 1, -1).setPiece(2, 3, 1).setPiece(1, 4, -1).setPiece(1, 6, -1).setPiece(3, 4, -1).setPiece(5, 6, -1);
		// this.game.regenerateGrid().initializeTurn();

		// TEST KING
		this.game.gameBoard.createBoard().setPiece(2, 7, -2).setPiece(5, 0, 2).setPiece(2, 1, 1).setPiece(5, 6, -1).setPiece(2, 3, 1);
		this.game.regenerateGrid().initializeTurn();
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
