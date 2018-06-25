module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
	reminderGet: reminderGet,
	reminderSet: reminderSet,
	reminderQuit: reminderQuit
}

let tmpState = 'Default';

function getWaitState(userID) {
	return tmpState;
}

function setWaitState(userID, nextState) {
	tmpState = nextState;
	console.log(`tmpState is ${tmpState}`)
}

function reminderGet(userID) {
	return ['8:23AM', '12:00PM', '10:50PM'];
}

function reminderSet(userID, time) {
	return null;
}

function reminderQuit(userID) {
	console.log('AT REMINDERQUIT')
	return null;
}