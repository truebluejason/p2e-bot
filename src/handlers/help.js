module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');

function check(userResp) {
	return true;
}

function send(userID, userResp) {
	return null;
}

function analyze(userID, userResp, nextSeqs) {
	return { nextSeqName: 'help', error: null };
}