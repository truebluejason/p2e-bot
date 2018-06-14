module.exports = {
  updateWaitState: updateWaitState
};

const config = require('config');

const cache = require('../helpers/cache.js');
const com = require('../helpers/communication.js');
const db = require('../helpers/db.js');

// Receive message or postback calls send function
// Treat default state specially?

const SEQUENCES = {
  help: {
    permittedStates: "All",
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
    nextActions: [ "nextPlan" ] // Upon being selected, eval nextAction's send function
  }
  nextPlan: {
    check: checkNextPlan,
    send: sendNextPlan, // Bot tells user to write plan
    newState: "CreatingPlan", // While waiting, user state is CreatingPlan
    afterWait: analyzeNextPlan, // Bot saves 'entry' and eval checks for nextActions - State not default so don't eval current send
    nextAction: null // Upon not being selected, revert state to "Default"
  }
}

const ACTIONS = {
  help: {
    noNextAction: 'yes', // Trigger respondHandler
    entryStates: 'all',
    check: checkHelp, // Payload is "HELP" <ASSUMES STATE IS CORRECT>
    respondHandler: respondHelp, // Send: "HERE ARE SOME THINGS YOU CAN DO"
    stateStartingNow: "Default", // State between sender and respondHandler trigger delay
    stateTransitioner: null,
    nextActions: null,
  },
  setReminder: {
    entryStates: 'all', 
    check: checkSetReminder, // Message NLP Processed is "Set reminder at time..."
    stateStartingNow: "Default",
    respondHandler: respondSetReminder, // Send: "REMINDER FOR 8:15AM SET"
    stateTransitioner: null,
    nextActions: null,
  },
  remind: {
    noNextAction: 'no', // Once entered through STATE, skip respondHandler !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    entryStates: 'all',
    check: checkSetReminder, // Is Poll and current time matches user's time
    respondHandler: handleRemind, // Send: "TIME TO MEDITATE!"
    stateStartingNow: "ReceivingReminder",
    stateTransitioner: transitionRemind, // "Check if Done or Timeout" - selects next action based on nextActions and checks of those next actions
    nextActions: [options, notDoneReason],
  },
  options: {
    calledByAction: 'yes', // Trigger respondHandler
    entryStates: 'ReceivingReminder',
    check: checkOptions,
    respondHandler: handleOptions, // "Virtue or Hindrance?"
    stateStartingNow: "SelectingOptions",
    stateTransitioner: transitionOptions,
    nextActions: [virtues, hindrances] // "Check if Virtue or Hindrance"
  },
  notDoneReason: {
    entryStates: 'ReceivingReminder',
    sender: sendNotDoneReason, // "Why didn't you do it"
    stateStartingNow: "WhyLazy",
    respondHandler: handleNotDoneReason // "Log user reason"
  }
}

const STATES = {
  Default: {
    // potentialActions: help, setReminder, quitReminder, reminderSent...
    // potentialActionsCheck: helpCheck, setReminderCheck, ...
    // respHandlers: helpHandler, setReminderHandler...

  },
  ReminderSent: {
    description: "Wait for user to perform an action (postback) or for reminder to time out (poll)",
    handler: handlerReminderSent, // "trigger: {text: "meditation time", content: {quickReply}}"
    nextStates: [
      { waitState: "DoneOptions", type: "postback" }, // text: "Choose between virtue and hindrance"
      { waitState: "NotDoneReason", type: "message" } // text: "Why didn't you do it"
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
  nextStates = STATES[currState]['nextStates'];
  nextState = nextStates.find(obj => obj['waitState'] === userResp);
  return nextState['waitState'];
}