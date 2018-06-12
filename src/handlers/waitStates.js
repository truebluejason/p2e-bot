module.exports = STATES;

const STATES = {
	Default: {

	},
	ReminderSent: {
		description: "Wait for user to perform an action (postback) or for reminder to time out (poll)",
		handler: listenReminderSent,
		outcomes: [
			"DoneOptions",
			"NotDoneReason"
		],
		error: handleError
	},
	DoneOptions: {

	},
	DoneVirtue: {

	},
	DoneHindrance: {

	},
	DonePlan: {

	},
	NotDoneReason: {

	},
	NotDonePlan: {

	},
	ReminderQuit: {

	}
}

const com = require('../helpers/communication.js');
const db = require('../helpers/db.js');

function setWaitState(userID, nextState) {
	// Record analytics here?
	db.setWaitState(userID, nextState);
}

function listenReminderSent(userID, done) {
	if (done) {
		console.log('Done');
		setWaitState(userID, STATES["DoneOptions"]);
	} else {
		console.log('NotDone');
		setWaitState(userID, STATES["NotDoneReason"]);
	}
}

function handleError(userID, reason = '') {
	com.sendTextMessage(userID, "I don't understand.");
	console.log(`[Error: State] related to userID ${userID}`);
	if (reason != '') {
		console.log(`  Reason: ${reason}`);
	}
	setWaitState(userID, "Default");
}