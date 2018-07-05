module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');

function check(userResp) {
	return userResp.match('.*help.*');
}

function send(userID, userResp) {
	let explain = "I assist your meditation by reminding you to practice and reflect on your progress.\n\n" +
				"Everyday at specified times, I will send you a quote and an interactive chat sequence to help shape your journey for equanimity.\n\n" +
				"You can get started by scheduling daily reminder(s) as shown below.";
	com.sendTextMessage(userID, explain);
	let
		intro = 'Here are some things you can tell me to do.',
		info = userResp.reduce((res, desc) => res + "\n\n" + desc);
		outro = 'I may try to guess what you mean if I do not fully understand it.';
	com.sendTextMessage(userID, `${intro}\n\n${info}\n\n${outro}`);
	return null;
}
