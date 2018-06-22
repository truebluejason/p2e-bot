module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
}

function getWaitState(userID) {
	return 'Default';
}

function setWaitState(userID, nextState) {
	return 'Default';
}
