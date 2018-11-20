<template>
	<div class="piece" :class="[pieceColor, {'crown': isKing}]" v-if="piece">
		<span v-if="isKing" class="crown">👑</span>
	</div>
</template>

<script>
import {PIECES} from '../utils/constants.js';

export default {
	props: ['piece'],
	computed: {
		pieceColor() {
			if (this.piece < 0) {
				return 'black';
			} else return 'white';
		},

		isKing() {
			if (Math.abs(this.piece) === 2) return true;
			return false;
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
