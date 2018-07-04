module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');
const misc = require('../helpers/misc.js');

function check(userResp) {
	return userResp.match(/.*remind me.*/i) || userResp.match(/.*set reminder.*/i);
}

function send(userID, userResp) {
	let { times, error } = misc.extractTimes(userResp);
	if (error) {
		return error;
	}
	timesArray = times;
	error = db.reminderSet(userID, timesArray);
	if (error) {
		return error;
	}
	com.sendTextMessage(userID, `Reminder set at ${timesArray.reduce((resp, time) => resp + ' ' + time)}. See you then!`);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	return { nextSeqName: 'help', error: null };
}
