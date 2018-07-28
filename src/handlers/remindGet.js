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
	let {err, result} = db.reminderGet(userID);
	if (err) {
		return new Error(`Could not get reminders for user with ID ${userID}`);
	}
	let
		intro = result.length ? "Here are your reminders:\n\n" : 'You have no reminders set.',
		formatted = result.length ? `_${result.reduce((resp, reminder) => resp + '_\n_' + reminder)}_` : '',
		outro = "Message '*help*' to learn how to add / remove reminders.";
	com.sendTextMessage(userID, `${intro}${formatted}\n\n${outro}`);
	return null;
}
