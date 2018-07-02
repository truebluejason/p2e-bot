module.exports = {
	check: check,
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

const PAYLOADS = {"Task Finished": "Task Finished", "Won't Do": "Won't Do"};

function check(userResp) {
	return userResp.match('PollNotification') || userResp.match('PollInterrupt');
}

function send(userID, userResp) {
	if (!userResp instanceof Object) {
		return new Error('Remind sequence expected userResp of type Object.');
	}
	let { message, interrupt } = userResp;

	// If user hasn't responded to previous request
	if (interrupt) {
		if (db.createInterruptEntry(userID)) {
			error = new Error(`Interrupt entry not created for user ${userID}.`);
			return error;
		}
	}

	message = `${message}\n\nPlease choose one of the responses below after finishing the practice.`
	com.sendQuickReply(userID, message, PAYLOADS);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS["Task Finished"]:
			if (db.createEntry(userID, 'Done')) {
				error = new Error(`DoneEntry not created for user ${userID}.`);
			}
			nextSeqName = nextSeqs[0];
			break;
		case PAYLOADS["Won't Do"]:
			if (db.createEntry(userID, 'NotDone')) {
				error = new Error(`NotDoneEntry not created for user ${userID}.`);
			}
			nextSeqName = nextSeqs[1];
			break;
		default:
			error = new Error(`Invalid quick reply answer for user ${userID}`);
	}
	return {nextSeqName: nextSeqName, error: error};
}