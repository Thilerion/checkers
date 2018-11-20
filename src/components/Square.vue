<template>
	<div class="square" :class="[typeClass]">
		<div class="overlay selected" v-if="selected"></div>
		<div class="overlay" :class="possibleMoveClass" v-else-if="possibleMoveClass"></div>
		<slot/>
	</div>
</template>

<script>
import {SQUARE_TYPES} from '../utils/constants.js';

export default {
	props: ['square'],
	data() {
		return {
			color: this.square.squareColor
		}
	},
	computed: {
		selected() {
			return this.square.selected;
		},
		possibleMoveClass() {
			if (this.square.isPossiblePrimaryMove) return 'primary-move';
			else if (this.square.isPossibleNextMove) return 'next-move';
			else if (this.square.isPossibleHit) return 'possible-hit';
			else return;
		},
		typeClass() {
			if (this.color === SQUARE_TYPES.white) return 'square-white';
			return 'square-black';
		}
	}
}
</script>

<style scoped>
.square {
	width: 50px;
	height: 50px;
	margin: 1px;
	display: flex;
	position: relative;
}

.square-black {
	background: rgb(131, 101, 76);
}

.square-white {
	background: rgb(218, 206, 175);
}

.overlay {
	box-sizing: border-box;
	position: absolute;
	width: 100%;
	height: 100%;
}

.selected {
	border: 3px solid blue;
}

.primary-move {
	background: rgba(62, 62, 124, 1);
}

.next-move {
	background: rgb(98, 98, 150);
}

.possible-hit {
	background: rgba(106, 62, 124, 0.5);
}
</style>
