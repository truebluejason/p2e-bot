module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');

function check(userResp) {
	return userResp.match('.*help.*');
}

function send(userID, userResp) {
	com.sendTextMessage(userID, 'Hello, I am p2e-bot.');
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	return { nextSeqName: 'help', error: null };
}