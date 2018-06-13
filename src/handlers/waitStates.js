module.exports = {
  updateWaitState: updateWaitState
};

const config = require('config');

const cache = require('../helpers/cache.js');
const com = require('../helpers/communication.js');
const db = require('../helpers/db.js');

const STATES = {
  Default: {

  },
  ReminderSent: {
    description: "Wait for user to perform an action (postback) or for reminder to time out (poll)",
    handler: handlerReminderSent,
    outcomes: [
      { waitState: "DoneOptions", type: "postback" },
      { waitState: "NotDoneReason", type: "poll" }
    ],
    error: { handler: handlerError, waitState: "Default" }
  },
  DoneOptions: {

  },
  DoneVirtue: {

  },
  DoneHindrance: {

  },
  DonePlan: {

  },
  NotDoneReason: {

  },
  NotDonePlan: {

  },
  ReminderQuit: {

  }
};

function updateWaitState(userID, userResp, currState) {
  let handler, nextState, handlerError;

  try {

    handler = STATES[currState]['handler'];
    handler(userID, userResp);
    nextState = evalNextState(userResp, currState);

  } catch(error) {

    handlerError = STATES[currState]['error']['handler'];
    handlerError(userID, error.message);
    nextState = STATES[currState]['error']['waitState'];

  }

  setWaitState(userID, nextState);
}

function handlerGeneral(userID, userResp) {

}

function handlerReminderSent(userID, done) {
  if (done) {
    console.log('Done');
    setWaitState(userID, STATES["DoneOptions"]);
  } else {
    console.log('NotDone');
    setWaitState(userID, STATES["NotDoneReason"]);
  }
}

function handlerError(userID, reason = '') {
  com.sendTextMessage(userID, "I don't understand.");
  console.log(`[Error: State] related to userID: ${userID}`);
  if (reason != '') {
    console.log(`- Reason: ${reason}`);
  }
  setWaitState(userID, "Default");
}

function setWaitState(userID, nextState) {
  try {

    if (!nextState) {
      throw new Error("setWaitState method's nextState field is undefined.");
    }
    cache.setWaitState(userID, nextState);
    db.setWaitState(userID, nextState);

  } catch(error) {
    // Record analytics here?
    console.log(`[Error: State] related to userID: ${userID}`);
    console.log(`- Reason: ${error.message}`);
  }
}

function evalNextState(userResp, currState) {
  outcomes = STATES[currState]['outcomes'];
  outcome = outcomes.find(obj => obj['waitState'] === userResp);
  return outcome['waitState'];
}