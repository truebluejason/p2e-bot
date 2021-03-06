module.exports = {
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

const PAYLOADS = {
	Bliss: "Bliss",
	Clarity: "Clarity",
	Compassion: "Compassion",
	Contentment: "Contentment",
	Faith: "Faith",
	Honesty: "Honesty"
};

function send(userID, userResp) {
	message = `Please choose a virtue to cultivate below.`
	com.sendQuickReply(userID, message, PAYLOADS);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		focus = null,
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS["Bliss"]:
			focus = PAYLOADS["Bliss"];
			break;
		case PAYLOADS["Clarity"]:
			focus = PAYLOADS["Clarity"];
			break;
		case PAYLOADS["Compassion"]:
			focus = PAYLOADS["Compassion"];
			break;
		case PAYLOADS["Contentment"]:
			focus = PAYLOADS["Contentment"];
			break;
		case PAYLOADS["Faith"]:
			focus = PAYLOADS["Faith"];
			break;
		case PAYLOADS["Honesty"]:
			focus = PAYLOADS["Honesty"];
			break;
		default:
			error = new Error(`Invalid quick reply answer for user ${userID}`);
	}
	if (!error) {
		if (db.updateCurrentEntry(userID, 'Area', focus)['err']) {
			error = new Error(`Could not finish updateCurrentEntry user ${userID}`);
		}
	}
	nextSeqName = nextSeqs[0];
	return {nextSeqName: nextSeqName, error: error};
}
