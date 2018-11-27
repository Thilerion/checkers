<template>
	<div class="piece" :class="[pieceColor, {'crown': isKing}]" v-if="piece">
		<span v-if="isKing" class="crown">👑</span>
	</div>
</template>

<script>
import {PIECES, PLAYER_BLACK, PLAYER_WHITE} from '../utils/constants.js';

export default {
	props: ['piece'],
	computed: {
		pieceColor() {
			return this.piece.player === PLAYER_BLACK ? 'black' : 'white';
		},

		isKing() {
			return this.piece.isKing();
		}
	}
}
</script>

<style scoped>
.piece {
	width: 65%;
	height: 65%;
	border-radius: 50%;
	/* margin: auto; */
	display: inline-flex;
	justify-content: center;
	align-items: center;
	align-self: center;
	justify-self: center;
	box-shadow: 1px 1px 4px -2px black;
	position: relative;
	z-index: 10;
}

.piece.black {
	background: black;
}

.piece.white {
	background: white;
}

.crown {
	font-size: 1rem;
	line-height: 1rem;
}
</style>
