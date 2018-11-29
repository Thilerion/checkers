class PlayerInterface {
	constructor(color, isHuman, sendMove, moves) {
		this.color = color;
		this.moves = moves;
		this.isHuman = isHuman;
		this.sendMove = sendMove;
	}
}

export class RandomAI extends PlayerInterface {
	constructor(color, moves, sendMove) {
		super(color, false, sendMove, moves);
	}

	makeMove() {
		console.log("Now requesting RandomAI to make a move.");

		if (!this.moves.validMoves.hasMoves()) return;

		const paths = this.moves.validMoves.paths;
		const path = paths[Math.floor(Math.random() * paths.length)];

		this.sendMove(path.getNextMove());
	}
}

export class HumanPlayer extends PlayerInterface {
	constructor(color, moves, sendMove) {
		super(color, true, sendMove, moves);
	}
}