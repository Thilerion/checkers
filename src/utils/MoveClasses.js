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
		this.moves = [...moves];
	}

	// TODO: could probably just check the first move
	mustCapture() {
		return this.moves.some(move => move.captured != null);
	}

	amount() {
		return this.moves.length;
	}

	startingPieceLocation() {
		return { ...this.moves[0].from };
	}

	startingPieceTypeId() {
		return this.moves[0].typeId;
	}

	getDestination() {
		return { ...this.moves[this.moves.length - 1].to };
	}

	getCaptures() {
		return this.moves.reduce((caps, move) => {
			if (move.captured != null) caps.push({ ...move.captured });
			return caps;
		}, []);
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

	pieceCanMove(x, y) {
		this.paths.forEach(movePath => {
			const pathStart = movePath.startingPieceLocation();
			if (x === pathStart.x && y === pathStart.y) return true;
		})
		return false;
	}

	getMovePathsForPiece(x, y) {
		return this.paths.filter(movePath => {
			const pathStart = movePath.startingPieceLocation();
			if (x === pathStart.x && y === pathStart.y) return true;
		})
	}

	mustCapture() {
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
}