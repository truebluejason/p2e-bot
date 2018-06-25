module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');

function check(userResp) {
	return userResp.match('.*remind me.*');
}

function send(userID, userResp) {
	com.sendTextMessage(userID, 'Let us just say that the reminder has been set.');
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	return { nextSeqName: 'help', error: null };
}