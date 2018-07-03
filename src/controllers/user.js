const db = require('../helpers/database.js');
const seq = require('./sequence');

module.exports = {
	evalMessage: evalMessage,
	evalPostback: evalPostback,
	evalPoll: evalPoll
};

function evalMessage(userID, message) {
	let userState = db.getWaitState(userID);
	if (!userState) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// Strip to barebone message content
	console.log(`Message / Payload ${message} received.`);
	seq.handleSequence(userID, message, userState);
}

function evalPostback(userID, payload) {
	let userState = db.getWaitState(userID);
	if (!userState) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	// Strip to barebone postback content
	console.log(`Payload ${payload} received.`);
	seq.handleSequence(userID, payload, userState);
}

function evalPoll(userID, contentID, message) {
	// Save task as not done if previous reminder times out
	if (!userID || !contentID) {
		console.log("The request's userID or contentID field is missing.");
		return;
	}
	let userState = db.getWaitState(userID);
	if (!userState) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	if (userState !== 'Default') {
		seq.handlePollInterrupt(userID, userState, message);
	} else {
		seq.handleSequence(userID, 'PollNotification', 'Default', { contentID: contentID, message: message });
	}
}