module.exports = {
	getWaitState: getWaitState,
	setWaitState: setWaitState,
	createUser: createUser,
	updateUserTimezone: updateUserTimezone,
	createCurrentEntry: createCurrentEntry,
	updateCurrentEntry: updateCurrentEntry,
	saveTimedOutEntry: saveTimedOutEntry,
	saveToEntry: saveToEntry,
	reminderGet: reminderGet,
	reminderSet: reminderSet,
	reminderQuit: reminderQuit
}

/*
- Example Operations
INSERT INTO CurrentEntries(UserID, ContentID, DoneStatus) VALUES ('111', 2, 'NotDone');
INSERT INTO Entries SELECT * FROM CurrentEntries WHERE UserID = '111';
DELETE FROM CurrentEntries WHERE UserID = '111';
INSERT INTO CurrentEntries(UserID, ContentID, DoneStatus) VALUES ('111', 2, 'NotDone');
UPDATE CurrentEntries SET Area = 'Faith' WHERE UserID = '111';
*/

const
	config = require('config'),
	misc = require('./misc'),
	mysql = require('sync-mysql');

let configObj = {
  host: config.get('db_host'),
  user: config.get('db_user'),
  password: config.get('db_password'),
  database: config.get('db_name')
};

// returns error and result
function execSQL(sql, values) {
	let con, err, result;
	try {
		con = new mysql(configObj);
		result = con.query(sql, values);
	} catch(error) {
		err = error;
		console.log(`[DB] Error message is ${err.message}`)
	}
	if (con instanceof mysql) con.dispose();
	return {err: err, result: result};
}

function getWaitState(userID) {
	let
		sql = 'SELECT State FROM Users WHERE UserID = ?;',
		values = [userID];

	let {err, result} = execSQL(sql, values);
	result = result && result[0] ? result[0]['State'] : 'NOUSER';
	console.log(`[DEBUG] Retrieved WaitState '${result}' for User '${userID}'.`);
	return {err: err, userState: result};
}

function setWaitState(userID, nextState) {
	let
		sql = 'UPDATE Users SET State = ? WHERE UserID = ?;',
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

function updateUserTimezone(userID, timeOffset) {
	let
		sql = 'UPDATE Users SET Timezone = ? WHERE UserID = ?;'
		values = [timeOffset, userID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

function createCurrentEntry(userID, contentID) {
	let
		now = new Date().toISOString().slice(0,10), // YYYY-MM-DD
		sql = 'INSERT INTO CurrentEntries(UserID, EntryDate, ContentID, DoneStatus) VALUES (?, ?, ?, "NotDone");',
		values = [userID, now, contentID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

// Check if currentEntry is set; if not return error, else modify the relevant row with field of interest
function updateCurrentEntry(userID, field, value) {
	let sql, values;
	switch(field) {
		case 'Area':
			sql = 'UPDATE CurrentEntries SET Area = ? WHERE UserID = ?;'
			values = [value, userID];
			break;
		case 'Plan':
			sql = 'UPDATE CurrentEntries SET Plan = ? WHERE UserID = ?;'
			values = [value, userID];
			break;
		case 'Remedy':
			sql = 'UPDATE CurrentEntries SET Remedy = ? WHERE UserID = ?;'
			values = [value, userID];
			break;
		case 'DoneStatus':
			sql = 'UPDATE CurrentEntries SET DoneStatus = ? WHERE UserID = ?;'
			values = [value, userID];
			break;
		default:
			return new Error('Update entry failed.');
	}
	let {err, result} = execSQL(sql, values);
	if (err) return {err: err};

	// CurrentEntry is finished when either field is set.
	if (field === 'Plan' || field === 'Remedy') {
		return saveToEntry(userID);
	}

	return {err: err, result: result};
}

function getCurrentEntry(userID) {
	let
		sql = 'SELECT * FROM CurrentEntries WHERE UserID = ?;',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	if (!result) return {err: new Error('No current entry available.')}
	return {err: err, result: result[0]};
}

function deleteCurrentEntry(userID) {
	let
		sql = 'DELETE FROM CurrentEntries WHERE UserID = ?;',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

// Save a NotDone entry without updating currentEntry field in user table
function saveTimedOutEntry(userID) {
	// call saveToEntry(userID);
	return saveToEntry(userID);
}

// Save user's currentEntry to entry database and delete it
function saveToEntry(userID) {
	let
		sql = 'INSERT INTO Entries SELECT * FROM CurrentEntries WHERE UserID = ?;',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	if (err) return {err: err};

	return deleteCurrentEntry(userID);
}

function reminderGet(userID) {
	let
		sql = 'SELECT Stamp FROM UserTimes WHERE UserID = ?;',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	result = result && result[0] ? result.map(obj => obj['Stamp']) : [];
	if (err) return {err: err};

	return {result: result};
}

function reminderSet(userID, timesArray) {
	let
		sql = 'SELECT Timezone FROM Users WHERE UserID = ?;',
		values = [userID];

	let {err, result} = execSQL(sql, values);
	if (err) return {err: err}

	offset = result && result[0] ? result[0]['Timezone'] : false;
	if (!offset) return { msg: "Please set your timezone first." }

	sql = 'INSERT INTO UserTimes(UserID, Stamp, AdjustedStamp) VALUES (?, ?, ?);';
	timesArray.forEach(time => {
		values = [userID, time, misc.adjustedTime(time, offset)];
		resp = execSQL(sql, values);
		if (resp['err']) return {err: resp['err']}
	});
	return {err: null};
}

function reminderQuit(userID) {
	let
		sql = 'DELETE FROM UserTimes WHERE UserID = ?;',
		values = [userID];
	let {err, result} = execSQL(sql, values);
	return {err: err};
}

