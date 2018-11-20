<template>
	<div class="square" :class="[typeClass]">
		<slot/>
	</div>
</template>

<script>
import {SQUARE_TYPES} from '../utils/constants.js';

export default {
	props: ['color'],
	computed: {
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
}

.square-black {
	background: rgb(131, 101, 76);
}

.square-white {
	background: rgb(218, 206, 175);
}
</style>
