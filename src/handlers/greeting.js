module.exports = {
	check: check,
	send: send,
	analyze: analyze
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');
const misc = require('../helpers/misc.js');

function check(userResp) {
	return userResp === 'GetStarted';
}

function send(userID, userResp) {
	let {err} = db.createUser(userID);
	if (err) return err;

	let resp = db.setWaitState(userID, 'Greeting');
	if (resp['err']) return resp['err'];
	
	let explain = "Welcome! I'm a bot that can assist your meditation by reminding you to practice and reflect on your progress.\n\n" +
				"To get started, please let me know what time it is for you so I can determine your time zone.\n- _Example_: 'It is 8:00AM.'";
	com.sendTextMessage(userID, explain);
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	let { times, error } = misc.extractTimes(userResp);
	if (error) {
		let msg = "The time you've given me is invalid. Please try again by typing '*update my timezone*'.";
		com.sendTextMessage(userID, msg)
		return {nextSeqName: null, error: new Error('Invalid time provided to Greeting')};
	}

	let time = times[0];
	console.log(`time is ${time}`)
	let timeOffset = misc.getTimeOffset(time);

	console.log(`updating userTimeZone with offset ${timeOffset}`)
	error = db.updateUserTimezone(userID, timeOffset)['err'];
	if (error) return {error: error};

	return {nextSeqName: nextSeqs[0], error: null};
}