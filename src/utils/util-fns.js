function coordsToIndex(x, y, size) {
	return (y * size) + x;
}

function indexToCoords(index, size) {
	return {
		x: index % size,
		y: Math.floor(index / size)
	};
}

export { coordsToIndex, indexToCoords };