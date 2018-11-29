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
					v-for="piece in pieces"
					v-if="piece && piece.alive"
					:key="piece.uid"
					:piece="piece"
					:style="getPiecePosition(piece)"
				/>
			</transition-group>
			
		</div>
		<button :disabled="!game.currentPlayerIsAI()" @click="requestAIMove">Request AI Move</button>
		<button :disabled="!game.canUnmakeMove()" @click="undoMove">Undo last move</button>
	</div>
</template>

<script>
import Checkers from './utils/Checkers.js';
import { Grid } from './utils/grid-ui.js';
import { PIECES, SQUARE_TYPES, PLAYER_WHITE, PLAYER_BLACK, RULES } from './utils/constants.js';
import { HumanPlayer, RandomAI } from './utils/Player.js';

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
			// game: new Checkers(RULES, RandomAI, RandomAI).initGame(),
			game: new Checkers(RULES, RandomAI, RandomAI).importGame([
				[0, 7, 1],
				[1, 6, -1],
				[2, 7, 1],
				[4, 7, 1],
				[6, 7, 1],
				[5, 6, -1],
				[3, 6, -1],
				[1, 4, -1]	
			], PLAYER_WHITE),
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
		}
	},
	methods: {
		getPiecePosition(piece) {
			return {
				'grid-column': `${piece.x + 1} / span 1`,
				'grid-row': `${piece.y + 1} / span 1`
			}
		},
		requestAIMove() {
			this.game.requestAiMove();
		},
		undoMove() {
			this.game.unmakeMove();
		}
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
	/* position: absolute; */
}

.move-piece-leave-active {
	transition: transform .5s;
}

.move-piece-leave-to {
	transform: scale(0);
}

.square-coords {
	position: absolute;
	color: black;
	background: rgb(255, 206, 206);
	opacity: 0.7;
	font-size: 12px;
}
</style>
