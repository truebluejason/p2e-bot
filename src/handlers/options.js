module.exports = {
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');

const PAYLOADS = {"Virtues": "Virtues", "Hindrances": "Hindrances"};

function send(userID, userResp) {
	message = `Which area of inner development do you want to focus on during your next practice?`
	com.sendQuickReply(userID, message, PAYLOADS);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS["Virtues"]:
			nextSeqName = nextSeqs[0];
			break;
		case PAYLOADS["Hindrances"]:
			nextSeqName = nextSeqs[1];
			break;
		default:
			error = new Error(`Invalid quick reply answer for user ${userID}`);
	}
	return {nextSeqName: nextSeqName, error: error};
}
