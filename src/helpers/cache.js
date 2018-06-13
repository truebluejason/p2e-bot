module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
}

function getWaitState(userID) {
	return 'STATE';
}

function setWaitState(userID, nextState) {
	return 'DONE';
}
