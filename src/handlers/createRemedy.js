module.exports = {
	send: send,
	analyze: analyze
};

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

function send(userID, userResp) {
	com.sendTextMessage(userID, 'Write 1 sentence action plan on how you will remedy the chosen hindrance.');
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let 
		nextSeqName = nextSeqs[0],
		error = null;
	if (db.updateCurrentEntry(userID, 'Remedy', userResp)['err']) {
		error = new Error(`Could not finish updateCurrentEntry user ${userID}`);
	}
	return { nextSeqName: nextSeqName, error: error };
}
