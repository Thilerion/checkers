class PlayerInterface {
	constructor(color, isHuman, sendMove) {
		this.color = color;
		this.validMoves = [];
		this.isHuman = isHuman;
		this.sendMove = sendMove;
	}

	setValidMoves(validMoves) {
		this.validMoves = validMoves;
		return this;
	}
}

export class RandomAI extends PlayerInterface {
	constructor(color, sendMove) {
		super(color, false, sendMove);
	}

	makeMove() {
		console.log("Now requesting RandomAI to make a move.");

		if (!this.validMoves.hasMoves()) return;

		const paths = this.validMoves.paths;
		const path = paths[Math.floor(Math.random() * paths.length)];

		console.log(path);

		this.sendMove(path.getNextMove());
	}
}

export class HumanPlayer extends PlayerInterface {
	constructor(color, sendMove) {
		super(color, true, sendMove);
	}
}