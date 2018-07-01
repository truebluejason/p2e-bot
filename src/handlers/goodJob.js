module.exports = {
	send: send
}

const com = require('../helpers/communication.js');

function send(userID, userResp) {
	com.sendTextMessage(userID, 'Great Job :)');
	return null;
}
