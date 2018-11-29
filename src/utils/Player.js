class PlayerInterface {
	constructor(color, isHuman, sendMove) {
		this.color = color;
		this.validMoves = [];
		this.isHuman = isHuman;
		this.sendMove = sendMove;
	}

	setValidMoves(validMoves) {
		this.validMoves = JSON.parse(JSON.stringify(validMoves));
		return this;
	}

	findValidMovePaths() {
		let paths = [];

		this.validMoves.forEach(piecePaths => {
			piecePaths.moves.forEach(path => {
				paths.push({ from: piecePaths.piece, moves: path });
			})
		})
		return paths;
	}
}

export class RandomAI extends PlayerInterface {
	constructor(color, sendMove) {
		super(color, false, sendMove);
	}

	makeMove() {
		console.log("Now requesting RandomAI to make a move.");

		if (this.validMoves.length <= 0) return;

		const validMovePaths = this.findValidMovePaths();
		const path = validMovePaths[Math.floor(Math.random() * validMovePaths.length)];

		const from = path.from;
		const to = path.moves[path.moves.length - 1];

		this.sendMove(from.x, from.y, to.x, to.y);
	}
}

export class HumanPlayer extends PlayerInterface {
	constructor(color, sendMove) {
		super(color, true, sendMove);
	}
}