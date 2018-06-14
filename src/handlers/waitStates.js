module.exports = {
  updateWaitState: updateWaitState
};

const config = require('config');

const cache = require('../helpers/cache.js');
const com = require('../helpers/communication.js');
const db = require('../helpers/db.js');


// Workflow
//  1. User or Poller hits an endpoint.
//  2. Bot retrieves user state from cache or database.
//  3. Bot determines which sequence user should undergo through evaluating check functions of all sequences permitted by user state.
//   - Only evaluate check functions when user state is Default - else map state to sequence one to one.
//  4. Bot triggers the sequence for user.

// Definition
//  Sequence: Bot sending the user a message and optionally waiting then processing a single user response.
//  Default state means the bot shouldn't expect a reply from the user.
//  Any other state means the bot should expect a reply from the user.

const SEQUENCES = {
  help: {
    check: checkHelp, // User asks for help and passes check - State is default so eval send function
    send: sendHelp, // Bot sends user help and doesn't expect a reply
    newState: "Default",
    afterWait: null,
    nextActions: null
  },
  remind: {
    check: checkRemind, // Poll update = State is default so eval send function
    send: sendRemind, // Bot sends user reminder and expects a reply
    newState: "ReceivingReminder", // While waiting, user state is ReceivingReminder
    afterWait: analyzeRemind, // Bot saves 'Done' or 'NotDone' status and eval checks for nextActions - State not default so don't eval current send
    nextActions: [ "options", "notDoneReason" ] // Upon being selected, eval nextAction's send function
  },
  options: {
    check: checkOptions,
    send: sendOptions, // Bot tells user to choose between virtues and hindrances
    newState: "SelectingOptions", // While waiting, user state is SelectingOptions
    afterWait: analyzeOptions, // Bot saves 'choice' and eval checks for nextActions - State not default so don't eval current send
    nextActions: [ "virtues", "hindrances" ] // Upon being selected, eval nextAction's send function
  },
  virtues: {
    check: checkVirtues,
    send: sendVirtues, // Bot tells user to choose from virtue list
    newState: "SelectingVirtues", // While waiting, user state is SelectingVirtues
    afterWait: analyzeVirtues, // Bot saves 'choice' and eval checks for nextActions - State not default so don't eval current send
    nextActions: [ "createPlan" ] // Upon being selected, eval nextAction's send function
  }
  createPlan: {
    check: checkCreatePlan,
    send: sendCreatePlan, // Bot tells user to write plan
    newState: "CreatingPlan", // While waiting, user state is CreatingPlan
    afterWait: analyzeCreatePlan, // Bot saves 'entry' and eval checks for nextActions - State not default so don't eval current send
    nextAction: [ "goodJob" ] // Upon being selected, eval nextAction's send function
  }
  goodJob: {
    check: checkGoodJob,
    send: sendGoodJob, // Bot tells user good job
    newState: "Default",
    afterWait: null,
    nextAction: null
  }
}

const STATES = {
  Default: {
    allowedSeqs: [ "help", "remind", "remindCancel", "remindSet" ]
  },
  ReceivingReminder: {
    allowedSeqs: [ "remind" ]
  },
  SelectingOptions: {
    allowedSeqs: [ "options" ]
  },
  SelectingVirtues: {
    allowedSeqs: [ "virtues" ]
  },
  SelectingHindrances: {
    allowedSeqs: [ "hindrances" ]
  },
  CreatingPlan: {
    allowedSeqs: [ "createPlan" ]
  },
  NotDoneReason: {
    allowedSeqs: [ "notDoneReason" ]
  },
  CreatingRemedy: {
    allowedSeqs: [ "createRemedy" ]
  },
  QuittingReminder: {
    allowedSeqs: [ "quit" ]
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
  nextStates = STATES[currState]['nextStates'];
  nextState = nextStates.find(obj => obj['waitState'] === userResp);
  return nextState['waitState'];
}