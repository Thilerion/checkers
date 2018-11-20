<template>
	<div class="square" :class="[typeClass]">
		<div class="selected" v-if="selected"></div>
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

.selected {
	box-sizing: border-box;
	border: 3px solid blue;
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
