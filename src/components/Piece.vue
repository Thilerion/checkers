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
			if (this.piece.type < 0) {
				return 'black';
			} else if (this.piece.type > 0) return 'white';
		},

		isKing() {
			return Math.abs(this.piece.type) > 1;
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
