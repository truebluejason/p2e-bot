module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

function check(userResp) {
	return userResp === 'GetStarted';
}

function send(userID, userResp) {
	let {err} = db.createUser(userID);
	if (err) return err;
	
	let explain = "Welcome! I'm a bot that can assist your meditation by reminding you to practice and reflect on your progress.\n\n" +
				"To get started, schedule a daily meditation reminder by typing '*remind me at <TIME>*'. " +
				"For example, you can message me '*remind me at 20:00*' if you want to be reminded everyday at 8PM. " +
				"The reminders can be viewed, changed, and deleted anytime.\n\n" +
				"Message me '*help*' if you want to learn more about how to use me.";
	com.sendTextMessage(userID, explain);
	return null;
}
