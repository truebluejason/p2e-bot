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
	let { contentID, contentType, payload, interrupt } = userResp;

	/*
	If user hasn't responded to previous request
	if (interrupt && db.saveTimedOutEntry(userID)['err']) {
		return new Error(`Interrupt entry not created for user ${userID}.`);
	}
	*/

	if (db.saveToEntry(userID)['err']) {
		return new Error(`currentEntry clearing returned an error for user ${userID}`);
	}

	// Create a currentEntry row to save content sent
	if (db.createCurrentEntry(userID, contentID)['err']) {
		return new Error(`currentEntry row not created for user ${userID}.`);
	}

	switch(contentType) {
		case 'Image':
			com.sendImageMessage(userID, payload, true);
			com.sendQuickReply(userID, 'Please choose one of the responses below after finishing the practice.', PAYLOADS, true);
			break;
		case 'Link':
			com.sendLinkMessage(userID, "Link of the Day", payload, true);
			com.sendQuickReply(userID, 'Please choose one of the responses below after finishing the practice.', PAYLOADS, true);
			break;
		case 'Quote':
			payload = `${payload}\n\nPlease choose one of the responses below after finishing the practice.`
			com.sendQuickReply(userID, payload, PAYLOADS, true)
			break;
		default:
			return new Error(`Invalid contentType received.`);
	};

	// USE THE FOLLOWING IN PRODUCTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//com.sendSubscriptionQuickReply(userID, message, PAYLOADS);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS["Task Finished"]:
			if (db.updateCurrentEntry(userID, 'DoneStatus', 'Done')['err']) {
				error = new Error(`Status not updated for user ${userID}.`);
			}
			nextSeqName = nextSeqs[0];
			break;
		case PAYLOADS["Won't Do"]:
			// DoneStatus is NotDone by default so do nothing
			nextSeqName = nextSeqs[1];
			break;
		default:
			error = new Error(`Invalid quick reply answer for user ${userID}`);
	}
	return {nextSeqName: nextSeqName, error: error};
}