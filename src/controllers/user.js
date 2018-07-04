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
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// Strip to barebone message content
	seq.handleSequence(userID, message, userState);
}

function evalPostback(userID, payload) {
	console.log(`Payload ${payload} received.`);
	let { err, userState } = db.getWaitState(userID);
	if (err) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// If payload is from a new user
	if (userState === 'NOUSER') {
		seq.handleSequence(userID, 'GetStarted', 'Default');
		return;
	}

	seq.handleSequence(userID, payload, userState);
}

function evalPoll(userID, contentID, message) {
	// Save task as not done if previous reminder times out
	if (!userID || !contentID) {
		console.log("The request's userID or contentID field is missing.");
		return;
	}
	let { err, userState } = db.getWaitState(userID);
	if (err) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	if (userState !== 'Default') {
		seq.handlePollInterrupt(userID, userState, message);
	} else {
		seq.handleSequence(userID, 'PollNotification', 'Default', { contentID: contentID, message: message });
	}
}