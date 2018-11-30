import { PIECES } from './constants.js';

export class Move {
	constructor(x, y) {
		this.from = { x, y };

		this.to;
		this.typeId;
		this.captured = null;
	}

	copy() {
		const copy = new Move(this.from.x, this.from.y)
			.setTypeId(this.typeId)
			.setDestination(this.to.x, this.to.y);
		
		if (this.captured != null) {
			copy.setCapture(this.captured.x, this.captured.y, this.captured.typeId);
		}
		return copy;
	}

	setDestination(x, y) {
		this.to = { x, y };
		return this;
	}

	setTypeId(typeId) {
		if (Object.values(PIECES).includes(typeId)) {
			this.typeId = typeId;
			return this;
		}
		else throw new Error(`TypeID ${typeId} is not a valid typeId.`);
	}

	setCapture(x, y, typeId) {
		this.captured = { x, y, typeId };
		return this;
	}
}

export class MovePath {
	constructor(moves) {
		this.executedMoves = [];
		this.moves = [...moves];
	}

	amount() {
		return this.moves.length;
	}

	startingPieceLocation() {
		return { ...this.moves[0].from };
	}

	startsWithPiece(x, y) {
		return this.moves[0].from.x === x && this.moves[0].from.y === y;
	}

	endsAtLocation(x, y) {
		const dest = this.getDestination();
		return dest.x === x && dest.y === y;
	}

	startingPieceTypeId() {
		return this.moves[0].typeId;
	}

	getDestination() {
		return { ...this.moves[this.moves.length - 1].to };
	}

	nextSquare() {
		if (this.moves.length > 0) {
			return { ...this.moves[0].to };
		} else {
			throw new Error("Can't check next square for a path without moves!");
		}
	}

	getNextMove() {
		if (this.moves.length > 0) {
			return this.moves[0];
		} else {
			throw new Error("Can't return next move when there is none!");
		}
	}

	locationIsNextLocation(x, y) {
		const next = this.nextSquare();
		return next.x === x && next.y === y;
	}

	getCaptures() {
		return this.moves.reduce((caps, move) => {
			if (move.captured != null) caps.push({ ...move.captured });
			return caps;
		}, []);
	}

	moveWasMade() {
		let move = this.moves.shift();
		this.executedMoves.push(move);
		return;
	}
}

export class ValidMoves {
	
	constructor(movePaths) {
		/*
		Example of paths:
		[Array of MovePaths:
			moves: [Array of Moves within path:
				{Move Object:
					from,
					captured,
					typeId,
					to
				}
			],
			moves: [Array of Moves in Path],
			moves: [Array of Moves in Path],
			...
		]
		*/
		this.paths = [...movePaths];
	}

	hasMoves() {
		return this.paths.length > 0;
	}

	pieceCanMove(x, y) {
		return this.paths.some(movePath => movePath.startsWithPiece(x, y));
	}

	getMovePathsForPiece(x, y) {
		return this.paths.filter(movePath => movePath.startsWithPiece(x, y));
	}

	getPathsWithOriginAndEnd({x: x0, y: y0}, {x: x1, y: y1}) {
		return this.paths.filter(movePath => {
			return movePath.startsWithPiece(x0, y0) && movePath.endsAtLocation(x1, y1);
		})
	}

	getPathsWithOriginAndNext({ x: x0, y: y0 }, { x: x1, y: y1 }) {
		return this.paths.filter(movePath => {
			return movePath.startsWithPiece(x0, y0) && movePath.locationIsNextLocation(x1, y1);
		})
	}

	getPathsWithMove(move) {
		return this.paths.filter(movePath => movePath.getNextMove() === move);
	}

	// used to check if a path that was chosen by AI or something is still up-to-date
	isPathCurrentlyValid(path) {
		return this.paths.some(validPath => validPath === path);
	}

	isMoveCurrentlyValid(move) {
		return this.paths.some(path => path.getNextMove() === move);
	}

	playerMustCapture() {
		return this.paths.some(path => path.mustCapture());
	}

	getMoveablePieceLocations() {
		const index = [];
		return this.paths.map(path => {
			return path.startingPieceLocation();
		}).filter(piece => {
			const key = `x${piece.x}y${piece.y}`;
			if (index.includes(key)) return false;
			index.push(key);
			return true;
		})
	}

	reducePathsWithMove(move) {
		if (this.getLengthOfPaths() === 1) {
			const finishedPath = this.getPathsWithMove(move);
			finishedPath[0].moveWasMade();
			this.paths = [];
			return { finished: true, path: finishedPath[0] };
		}

		const nextPossiblePaths = this.getPathsWithMove(move);
		
		nextPossiblePaths.forEach(path => {
			path.moveWasMade();
		})

		this.paths = nextPossiblePaths;
		return { finished: false };
	}

	getLengthOfPaths() {
		return this.paths.reduce((max, path) => Math.max(path.amount(), max), 0);
	}
}