module.exports = {
	check: check,
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');
const misc = require('../helpers/misc.js');

function check(userResp) {
	return userResp.match(/.*update my timezone.*/i);
}

function send(userID, userResp) {
	let message = "What time is it for you?";
	com.sendTextMessage(userID, message);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let { times, error } = misc.extractTimes(userResp);
	if (error) {
		let msg = "The time you've given me is invalid. Please try again by typing '*update my timezone*'.";
		com.sendTextMessage(userID, msg)
		return {error: new Error('Invalid time provided to timezoneUpdate')};
	}

	let time = times[0];
	let timeOffset = misc.getTimeOffset(time);

	error = db.updateUserTimezone(userID, timeOffset)['err'];
	if (error) return {error: error};

	return {nextSeqName: nextSeqs[0], error: null};
}