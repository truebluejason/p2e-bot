module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
	createUser: createUser,
	createCurrentEntry: createCurrentEntry,
	updateInterruptEntry: updateInterruptEntry,
	updateEntry: updateEntry,
	reminderGet: reminderGet,
	reminderSet: reminderSet,
	reminderQuit: reminderQuit
}

/*
- Example Operations
INSERT INTO Users(UserID, State) VALUES ('111', 'Default');
INSERT INTO Times(UserID, Stamp) VALUES ('111', '7:30');
INSERT INTO Contents(Type, Content) VALUES ('Quote', 'Yolo!');
INSERT INTO Contents(Type, Content) VALUES ('Quote', 'Peace.');
INSERT INTO CurrentEntries(UserID, ContentID, DoneStatus) VALUES ('111', 1, 'NotDone');
INSERT INTO Entries SELECT * FROM CurrentEntries WHERE UserID = '111';
DELETE FROM CurrentEntries WHERE UserID = '111';
INSERT INTO CurrentEntries(UserID, ContentID, DoneStatus) VALUES ('111', 2, 'NotDone');
UPDATE CurrentEntries SET Area = 'Faith' WHERE UserID = '111';
*/

const
	config = require('config'), 
	mysql = require('sync-mysql');

let configObj = {
  host: config.get('db_host'),
  user: config.get('db_user'),
  password: config.get('db_password'),
  database: config.get('db_name')
};
let tmpState = 'Default';

// returns error and result
function execSQL(sql, values) {
	let con, err, result;
	try {
		con = new mysql(configObj);
		result = con.query(sql, values);
	} catch(error) {
		err = error;
	}
	if (con instanceof mysql) con.dispose();
	return {err: err, result: result};
}

function getWaitState(userID) {
	let
		sql = 'SELECT State FROM Users WHERE UserID = ?',
		values = [userID];

	let {err, result} = execSQL(sql, values);
	result = result[0] ? result[0]['State'] : 'ERROR';
	return {err: err, userState: result};
}

function setWaitState(userID, nextState) {
	let
		sql = 'UPDATE Users SET State = ? WHERE UserID = ?',
		values = [nextState, userID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

function createUser(userID) {
	let
		sql = 'INSERT INTO Users(UserID, State) VALUES (?, "Default");',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

function createCurrentEntry(userID, contentID) {
	// status is 'Done' or 'NotDone'
	// status is NotDone as default
	console.log('At createCurrentEntry');
}

// Save a NotDone entry without updating currentEntry field in user table
function updateInterruptEntry(userID) {
	// call saveEntry(userID);
	console.log('At updateInterruptEntry');
}

// Check if currentEntry is set; if not return error, else modify the relevant row with field of interest
function updateEntry(userID, field, value) {
	console.log('At updateEntry');
	console.log('value: ' + value);
	switch(field) {
		case 'Area':
			break;
		case 'Plan':
			break;
		case 'Remedy':
			break;
		case 'DoneStatus':
			break;
		default:
			return new Error('Update entry failed.');
	}
	return null;
}

// Save user's currentEntry to entry database
function saveEntry(userID) {
	console.log('At saveEntry');
}

function reminderGet(userID) {
	return ['8:23AM', '12:00PM', '10:50PM'];
}

function reminderSet(userID, time) {
	return null;
}

function reminderQuit(userID) {
	console.log('AT REMINDERQUIT')
	return null;
}

