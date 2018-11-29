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

		if (this.validMoves.length <= 0) return;

		const validMovePaths = this.validMoves.paths;
		const path = validMovePaths[Math.floor(Math.random() * validMovePaths.length)];

		const from = path.startingPieceLocation();
		const to = path.getDestination();

		this.sendMove(from.x, from.y, to.x, to.y);
	}
}

export class HumanPlayer extends PlayerInterface {
	constructor(color, sendMove) {
		super(color, true, sendMove);
	}
}