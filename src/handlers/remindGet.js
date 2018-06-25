module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

function check(userResp) {
	return userResp.match(/.*get reminder.*/i) || userResp.match(/.*list reminder.*/i);
}

function send(userID, userResp) {
	let reminders = db.reminderGet(userID);
	if (!reminders) {
		return new Error(`Could not get reminders for user with ID ${userID}`);
	}
	let
		intro = "Here are your reminders.",
		formatted = reminders.reduce((resp, reminder) => resp + '\n' + reminder),
		outro = "Message 'help' to learn how to add / remove reminders.";
	com.sendTextMessage(userID, `${intro}\n${formatted}\n${outro}`);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	return { nextSeqName: 'help', error: null };
}