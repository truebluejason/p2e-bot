module.exports = {
	check: check,
	send: send
}

const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

function check(userResp) {
	return userResp.match(/.*get response.*/i) || userResp.match(/.*list response.*/i);
}

function send(userID, userResp) {
	let {err, result} = db.responseGet(userID);
	if (err) {
		return new Error(`Could not get reminders for user with ID ${userID}`);
	}
	if (result.length) {
		debugger;
		templateArray = result.map(res => {
			let template;
			if (res['DoneStatus'] === 'Done') {
				template = {
					image_url: "https://i.pinimg.com/originals/36/3c/25/363c2582a5ea674b00f7815c06e2e06f.jpg",
					title: `${res['EntryDate'].split('T')[0]} - Practice Done`,
					subtitle: `\nTarget: ${res['Area']}\nAction Plan: ${res['Plan']}`
				};
			} else {
				template = {
					image_url: "http://www.dcsmat.ac.in/wp-content/uploads/wordpress/Buddha1.jpg",
					title: `${res['EntryDate'].split('T')[0]} - Practice Not Done`,
					subtitle: `\nTarget: ${res['Area']}\nAction Plan: ${res['Remedy']}`
				};
			}
			return template
		});
		debugger;
		com.sendTemplateMessage(userID, templateArray);
	} else {
		let message = "You do not have any responses yet. Get started by setting reminders."
		com.sendTextMessage(userID, message);
	}
	/*
	let
		intro = result.length ? "Here are your reminders:\n\n" : 'You have no reminders set.',
		formatted = result.length ? `_${result.reduce((resp, reminder) => resp + '_\n_' + reminder)}_` : '',
		outro = "Message '*help*' to learn how to add / remove reminders.";
	com.sendTextMessage(userID, `${intro}${formatted}\n\n${outro}`);
	*/
	return null;
}
