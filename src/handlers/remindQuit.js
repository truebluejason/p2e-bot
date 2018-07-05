module.exports = {
	check: check,
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

const PAYLOADS = {yes: 'yes', no: 'no'};

function check(userResp) {
	return userResp.match(/.*delete all reminders.*/);
}

function send(userID, userResp) {
	com.sendQuickReply(userID, 
		'Are you sure about deleting all reminders?',
		PAYLOADS
	);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS['yes']:
			if (db.reminderQuit(userID)['err']) {
				error = new Error(`Reminder failed to be quit for user ${userID}.`);
			}
			nextSeqName = nextSeqs[0];
			break;
		case PAYLOADS['no']:
			nextSeqName = nextSeqs[1];
			break;
		default:
			error = new Error(`Invalid quick reply answer for user ${userID}`);
	}
	return {nextSeqName: nextSeqName, error: error};
}