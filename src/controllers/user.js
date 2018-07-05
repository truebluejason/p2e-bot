const db = require('../helpers/database.js');
const seq = require('./sequence');

module.exports = {
	evalMessage: evalMessage,
	evalPostback: evalPostback,
	evalPoll: evalPoll
};

function evalMessage(userID, message) {
	console.log(`Message / Payload ${message} received.`);
	let { err, userState } = db.getWaitState(userID);
	if (err) {
		console.log('[Error: DB] db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// Strip to barebone message content
	seq.handleSequence(userID, message, userState);
}

function evalPostback(userID, payload) {
	console.log(`Payload ${payload} received.`);
	let { err, userState } = db.getWaitState(userID);
	if (err) {
		console.log('[Error: DB] db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// If payload is from a new user
	if (userState === 'NOUSER') {
		seq.handleSequence(userID, 'GetStarted', 'Default');
		return;
	}

	seq.handleSequence(userID, payload, userState);
}

function evalPoll(userID, data) {
	// Save task as not done if previous reminder times out
	if (!data['userID'] || !data['contentID'] || !data['contentType'] || !data['payload']) {
		console.log("[Error: Poll] The request's field is missing.");
		return;
	}
	let { err, userState } = db.getWaitState(userID);
	if (err) {
		console.log('[Error: DB] db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	if (userState !== 'Default') {
		seq.handlePollInterrupt(userID, userState, data);
	} else {
		seq.handleSequence(userID, 'PollNotification', 'Default', data);
	}
}