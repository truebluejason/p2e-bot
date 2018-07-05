module.exports = {
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

const PAYLOADS = {
	Agitation: "Agitation",
	Desire: "Desire",
	Distaste: "Distaste",
	Doubt: "Doubt",
	Lethargy: "Lethargy",
	Procrastination: "Procrastination"
};

function send(userID, userResp) {
	message = `Please choose a hindrance that prompted you not to meditate this time.`
	com.sendQuickReply(userID, message, PAYLOADS);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		focus = null,
		nextSeqName = null,
		error = null;
	switch(userResp) {
		case PAYLOADS["Agitation"]:
			focus = PAYLOADS["Agitation"];
			break;
		case PAYLOADS["Desire"]:
			focus = PAYLOADS["Desire"];
			break;
		case PAYLOADS["Distaste"]:
			focus = PAYLOADS["Distaste"];
			break;
		case PAYLOADS["Doubt"]:
			focus = PAYLOADS["Doubt"];
			break;
		case PAYLOADS["Lethargy"]:
			focus = PAYLOADS["Lethargy"];
			break;
		case PAYLOADS["Procrastination"]:
			focus = PAYLOADS["Procrastination"];
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