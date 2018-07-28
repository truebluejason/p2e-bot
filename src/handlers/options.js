module.exports = {
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');

const PAYLOADS = {"Virtues": "Virtues", "Hindrances": "Hindrances"};

function send(userID, userResp) {
	message = "Please choose an area of inner development to focus on before or during your next practice.\n\n" + 
			"- _If the practice went smoothly, appreciate your experience and select *Virtues*_.\n\n" + 
			"- _If the practice went roughly, savour this opportunity to face your obstacles and select *Hindrances*_."
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
