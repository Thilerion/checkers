<template>
	<div class="piece" :class="[typeClass, playerClass]" v-if="piece">
		<span class="crown" v-if="typeClass === 'king'">👑</span>
	</div>
</template>

<script>
import {PLAYER_BLACK, PLAYER_WHITE, PIECE_KING, PIECE_MAN} from '../utils/constants.js';

export default {
	props: ['piece'],
	computed: {
		typeClass() {
			if (this.piece.type === PIECE_KING) return 'king';
			return 'man';
		},
		playerClass() {
			if (this.piece.playerId === PLAYER_BLACK) return 'black';
			return 'white';
		}
	}
}
</script>

<style scoped>
.piece {
	width: 65%;
	height: 65%;
	border-radius: 50%;
	margin: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 1px 1px 4px -2px black;
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
