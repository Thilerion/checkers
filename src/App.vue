<template>
	<div id="app">
	</div>
</template>

<script>
import {Checkers, Board} from './utils/game.js';

export default {
	name: "app",
	components: {

	},
	data() {
		return {
			game: new Checkers()
		}
	}
};
</script>

<style>

</style>
