<template>
	<div id="app">
		<div class="board-container">
			<div class="board board-background">
				<SquareComponent
					v-for="(square, sqIndex) in grid"
					:key="sqIndex"
					:square="square"
				>
					<span class="square-coords">{{square.x}},{{square.y}}</span>
				</SquareComponent>
			</div>

			<transition-group tag="div" name="move-piece" class="board board-pieces">
				<PieceComponent
					v-for="(piece, pieceIndex) in pieces"
					v-if="piece && piece.alive"
					:key="pieceIndex"
					:piece="piece"
					:style="getPiecePosition(piece)"
				/>
			</transition-group>
			
		</div>

		<!-- <div class="board">
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
		</div> -->
		<!-- <div class="gameState">
			<div v-if="!winner" class="playing">
				<p>Current player: {{currentPlayer}}</p>
				<p>Zet {{game.moveNumber + 1}}</p>
				<h2>Pieces Left</h2>
				<p>White: {{whitePiecesLeft}}</p>
				<p>Black: {{blackPiecesLeft}}</p>
			</div>
			<div v-else class="game-end">
				<p>{{winner}} player has won!</p>
			</div>
		</div> -->
	</div>
</template>

<script>
import Checkers from './utils/Checkers.js';
import {Grid} from './utils/grid-ui.js';
import {PIECES, SQUARE_TYPES, PLAYER_WHITE, PLAYER_BLACK, RULES} from './utils/constants.js';

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
			game: new Checkers().initGame(),
			gridComp: new Grid(RULES.size)
		}
	},
	computed: {
		size() {
			return this.game.size;
		},
		pieces() {
			return this.game.gameState.pieces;
		},
		grid() {
			return this.gridComp.grid.flat();
		},
		whitePiecesLeft() {
			//return this.game.gameBoard.piecesLeft[PLAYER_WHITE];
		},
		blackPiecesLeft() {
			//return this.game.gameBoard.piecesLeft[PLAYER_BLACK];
		},
		currentPlayer() {
			//return this.game.currentPlayer === PLAYER_BLACK ? "Black" : "White";
		},
		winner() {
			//if (!this.game.gameEnd) return;

			//return `${this.game.winner.charAt(0).toUpperCase()}${this.game.winner.slice(1)}`;
		}
	},
	methods: {
		getPiecePosition(piece) {
			return {
				'grid-column': `${piece.x + 1} / span 1`,
				'grid-row': `${piece.y + 1} / span 1`
			}
		}
	},
	mounted() {
		
	}
};
</script>

<style>
.board {
	display: grid;
	grid-template-columns: repeat(8, 50px);
	grid-template-rows: repeat(8, 50px);
	grid-gap: 2px;
	user-select: none;
}

.board-background {
	position: absolute;
}

.move-piece-move {
	transition: transform .3s;
}

.square-coords {
	position: absolute;
	color: black;
	background: rgb(255, 206, 206);
	opacity: 0.7;
	font-size: 12px;
}
</style>
