export class HistoryItem {
	constructor(player, uid) {
		this.player = player;
		this.pieceUID = uid;
		this.moves = [];
		this.finished = false;
		this.wasCrowned = false;
	}

	addMove(move) {
		debugger;
		this.moves.push(move);
		return this;
	}

	finish() {
		this.finished = true;
		return this;
	}

	addPath(path) {
		for (let i = 0; i < path.length; i++) {
			this.addMove(path.moves[i]);
		}
		return this.finish();
	}

	getCapturedPieces() {
		let caps = [];
		for (let i = 0; i < this.moves.length; i++) {
			if (this.moves[i].captured != null) {
				caps.push(this.moves[i].captured);
			}
		}
		return caps;
	}

	getInitialPosition() {
		return this.moves[0].from;
	}

	getLastPosition() {
		return this.moves[this.moves.length - 1].to;
	}

	setWasCrowned(bool) {
		this.wasCrowned = !!bool;
	}
}

export class History {
	constructor() {
		this.moveInProgress = false;
		this.items = [];
	}

	lastItem() {
		return this.items[this.items.length - 1];
	}

	addMove(move, finished, player, uid) {
		if (this.moveInProgress) {
			const item = this.lastItem();
			item.addMove(move);
			if (finished) {
				item.finish();
				this.moveInProgress = false;
			}
		} else {
			let item = new HistoryItem(player, uid).addMove(move);
			if (finished) {
				item.finish();
			} else {
				this.moveInProgress = true;
			}
			this.items.push(item);
		}
		return this;
	}

	undo() {
		this.moveInProgress = false;

		// TODO: maybe only change pointer to current position in history
		let lastItem = this.items.pop();

		return {
			wasCrowned: lastItem.wasCrowned,
			uid: lastItem.pieceUID,
			initialPos: lastItem.getInitialPosition(),
			currentPos: lastItem.getLastPosition(),
			revivePieces: lastItem.getCapturedPieces(),
			wasFinished: lastItem.finished
		};
	}
}