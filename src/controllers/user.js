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

function evalPoll(userID, message) {
	// What to do if user's state isn't default?
	// - Likely save task as not done and revert everything to default
	let userState = db.getWaitState(userID);
	if (!userState) {
		console.log('db.getWaitState for ' + userID + ' has failed.');
		return;
	}
	if (userState !== 'Default') {
		seq.handlePollInterrupt(userID, userState, message);
		return;
	}
	seq.handleSequence(userID, 'PollNotification', 'Default', { message: message });
}