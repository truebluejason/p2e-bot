module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
	createEntry: createEntry,
	createInterruptEntry: createInterruptEntry,
	updateEntry: updateEntry,
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

// Create Done or NotDone row in user table and save the row identifier in currentEntry field in the user table
function createEntry(userID, status) {
	// status is 'Done' or 'NotDone'
	console.log('At createEntry');
}

// Save a NotDone entry without updating currentEntry field in user table
function createInterruptEntry(userID) {
	console.log('At createInterruptEntry');
}

// Check if currentEntry is set; if not return error, else modify the relevant row with field of interest
function updateEntry(userID, field, value) {
	console.log('At updateEntry');
	console.log('value: ' + value);
	switch(field) {
		case 'Area':
			break;
		case 'Plan':
			break;
		case 'Remedy':
			break;
		default:
			return new Error('Update entry failed.');
	}
	return null;
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