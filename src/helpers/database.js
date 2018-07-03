module.exports = {
	initConnectionObject: initConnectionObject,
	getWaitState: getWaitState,
	setWaitState: setWaitState,
	createCurrentEntry: createCurrentEntry,
	updateInterruptEntry: updateInterruptEntry,
	updateEntry: updateEntry,
	reminderGet: reminderGet,
	reminderSet: reminderSet,
	reminderQuit: reminderQuit
}

/*
- Create Database
CREATE DATABASE P2E;


- Create Tables
CREATE TABLE Users (
  UserID VARCHAR(128) UNIQUE NOT NULL,
  State VARCHAR(128) NOT NULL,
  Name VARCHAR(128),
  PRIMARY KEY (UserID)
);
CREATE TABLE Contents (
  ContentID INT AUTO_INCREMENT UNIQUE NOT NULL, 
  Type ENUM('Image','Link','Quote') NOT NULL, 
  Content VARCHAR(256) NOT NULL,
  Priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  PRIMARY KEY (ContentID)
);
CREATE TABLE Times (
  UserID VARCHAR(128) NOT NULL, 
  Stamp TIME,
  FOREIGN KEY (UserID) References Users(UserID)
);
CREATE TABLE Entries (
  UserID VARCHAR(128) NOT NULL, 
  ContentID INT NOT NULL, 
  DoneStatus ENUM('Done','NotDone') NOT NULL, 
  Area VARCHAR(128), 
  Plan VARCHAR(256), 
  Remedy VARCHAR(256),
  FOREIGN KEY (UserID) References Users(UserID),
  FOREIGN KEY (ContentID) References Contents(ContentID)
);
CREATE TABLE CurrentEntries (
  UserID VARCHAR(128) UNIQUE NOT NULL, 
  ContentID INT NOT NULL, 
  DoneStatus ENUM('Done','NotDone') NOT NULL, 
  Area VARCHAR(128), 
  Plan VARCHAR(256), 
  Remedy VARCHAR(256),
  FOREIGN KEY (UserID) References Users(UserID),
  FOREIGN KEY (ContentID) References Contents(ContentID)
);


- Create Indexes
CREATE INDEX UserIDX ON Users(UserID);
CREATE INDEX ContentIDX ON Contents(ContentID);
CREATE INDEX StampIDX ON Times(Stamp);
CREATE INDEX EntryIDX ON Entries(UserID);
CREATE INDEX CurrentEntryIDX ON CurrentEntries(UserID);


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

const mysql = require('mysql');
const { promisify } = require('util');

let con, connectPromise, queryPromise;
let tmpState = 'Default';

function initConnectionObject(configObj) {
	con = mysql.createConnection(configObj);
	// Convert connect and query methods to Promises to be used with async/await
	connectPromise = promisify(con.connect);
	queryPromise = promisify(con.query);

	let {err, result} = execSQL('SELECT * FROM Users');
	console.log('query error: ' + err);
	console.log('query result: ' + result);
}

/*
returns {err, result}
*/
async function execSQL(sql) {
	let err, result, fields;

	debugger;
	try {
		err = await connectPromise();
		debugger;
		console.log(`after connectPromise, err: ${err}`);
		if (err) throw err;

		result = await queryPromise(sql);
		//{ err, result, fields } = await queryPromise(sql);
		console.log(`after connectPromise, err: ${err}, result: ${result}, fields: ${fields}`);
		if (err) throw err;

		return {result: result};
	} catch(err) {
		console.log(err.message);
		debugger;
		return {err: err};
	}
}

async function waitFor(value) {
	
}

function getWaitState(userID) {
	return tmpState;
}

function setWaitState(userID, nextState) {
	tmpState = nextState;
	console.log(`tmpState is ${tmpState}`)
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

