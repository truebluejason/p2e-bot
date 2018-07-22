module.exports = {
	send: send
}

const com = require('../helpers/communication.js');

function send(userID, userResp) {
	com.sendTextMessage(userID, "Your timezone has been updated.\n\nMessage me '*help*' to discover how to set meditation reminders!");
	return null;
}
