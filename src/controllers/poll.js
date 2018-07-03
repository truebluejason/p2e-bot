const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');
const user = require('./user.js');

/*
Request Types: Poll

Poll: Supplies userID, userName, and message to send
Format
{
	userID: '<Id>',
	userName: '<Name>',
	contentID: '<Id>',
	message: '<Message to Send>'
}
*/
function respond(req, res) {
	const data = req.body;
	if (data) {
		let { userID, contentID, message } = data;
		user.evalPoll(userID, contentID, message);
	}
	res.status(200).send('Poll received');
}

exports.respond = respond;