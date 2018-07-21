module.exports = {
  getBeginningSeqs: getBeginningSeqs,
  handlePollInterrupt: handlePollInterrupt,
  handleSequence: handleSequence
};

// const cache = require('../helpers/cache.js');
const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');
const handlers = require('../handlers');

/*

Overall Workflow
  1. User or Poller hits an endpoint.
  2. Bot retrieves user state from cache or database.
  3. Bot determines which sequence user should undergo through evaluating check functions of all sequences permitted by user state.
    - Only evaluate check functions when user state is Default - else map state to sequence one to one.
  4. Bot triggers the sequence for user.

Definition
- Sequence: Bot sending the user a message and optionally waiting then processing a single user response.
  + Default state means the bot shouldn't expect a reply from the user.
  + Any other state means the bot should expect a reply from the user.

Sequences Template
- check (userResp) => (boolean): Checks whether a sequence should be entered from Default state by examining user input
  + If this field is missing, a sequence is not accessible from Default state
- send (userID, userResp) => (error): Bot sends a message to user and sets the waitState
  + If userResp is null, don't bother analyzing
- analyze (userID, userResp, nextSeqs) => (string, error): Bot analyzes response sent by user and return name of the next sequence
- nextSeqs (array): Contains strings that analyze refers to for returning the next sequence

*/

const SEQUENCES = {
  Help: {
    desc: "*help*: Describe things you can tell me to do.",
    check: handlers.help.check,
    send: handlers.help.send
  },
  Greeting: {
    check: handlers.greeting.check,
    send: handlers.greeting.send,
    analyze: handlers.greeting.analyze,
    nextSeqs: [ "TimezoneSet" ]
  },
  TimezoneUpdate: {
    desc: "*update my timezone*: Update your timezone in my database.",
    check: handlers.timezoneUpdate.check,
    send: handlers.timezoneUpdate.send,
    analyze: handlers.timezoneUpdate.analyze,
    nextSeqs: [ "TimezoneSet" ]
  },
  TimezoneSet: {
    send: handlers.timezoneSet.send
  },
  RemindGet: {
    desc: "*get reminders*: Get your previously set reminders.",
    check: handlers.remindGet.check,
    send: handlers.remindGet.send
  },
  RemindSet: {
    desc: "*remind me at <TIME>*: Schedule a daily reminder between 0:00 - 23:59.\n- _Example_: 'remind me at 21:30'",
    check: handlers.remindSet.check,
    send: handlers.remindSet.send
  },
  RemindQuit: {
    desc: "*delete all reminders*: Delete all previously set reminders.",
    check: handlers.remindQuit.check,
    send: handlers.remindQuit.send,
    analyze: handlers.remindQuit.analyze,
    nextSeqs: [ "Quitted", "NotQuitted" ]
  },
  Quitted: {
    send: handlers.quitted.send
  },
  NotQuitted: {
    send: handlers.notQuitted.send
  },
  Remind: {
    check: handlers.remind.check,
    send: handlers.remind.send,
    analyze: handlers.remind.analyze,
    nextSeqs: [ "Options", "NotDoneReason" ]
  },
  Options: {
    send: handlers.options.send,
    analyze: handlers.options.analyze,
    nextSeqs: [ "Virtues", "Hindrances" ]
  },
  Virtues: {
    send: handlers.virtues.send,
    analyze: handlers.virtues.analyze,
    nextSeqs: [ "CreatePlan" ]
  },
  Hindrances: {
    send: handlers.hindrances.send, 
    analyze: handlers.hindrances.analyze,
    nextSeqs: [ "CreatePlan" ]
  },
  CreatePlan: {
    send: handlers.createPlan.send,
    analyze: handlers.createPlan.analyze,
    nextSeqs: [ "GoodJob" ]
  },
  NotDoneReason: {
    send: handlers.notDoneReason.send,
    analyze: handlers.notDoneReason.analyze,
    nextSeqs: [ "CreateRemedy" ]
  },
  CreateRemedy: {
    send: handlers.createRemedy.send,
    analyze: handlers.createRemedy.analyze,
    nextSeqs: [ "GoodJob" ]
  },
  GoodJob: {
    send: handlers.goodJob.send
  }
}

/*
check function: (userResp, seqName) => boolean
send function: (userID, userResp, seqName) => boolean - if userResp is null, don't bother analyzing
analyze function: (userID, userResp, seqName) => boolean
*/

// Upon server starting, return an array of beginning sequence keys (sequences that start from default)
function getBeginningSeqs() {
  return Object.keys(SEQUENCES).filter(seqName => !!SEQUENCES[seqName]['check']);
}

function describeSeqs() {
  const descriptions = [];
  Object.keys(SEQUENCES).forEach(seqName => {
    let desc = SEQUENCES[seqName]['desc'];
    if (desc) {
      descriptions.push(desc);
    }
  });
  return descriptions;
}

function handleSequence(userID, userResp, currState, options = undefined) {
  try {
    let beginningSeqs = getBeginningSeqs();
    if (currState === 'Default') {
      let seqName = beginningSeqs.filter(seqName => callCheck(userResp, seqName))[0];
      if (seqName === undefined) {
        handleError(userID, 'Check', new Error('No matching check function for user response.'));
        return;
      }
      callSend(userID, userResp, seqName, options);
    } else {
      callAnalyze(userID, userResp, currState);
    }
  } catch(error) {
    console.log(`[Error: UNKNOWN] with message ${error.message} caught at top level.`);
  }
}

function callCheck(userResp, seqName) {
  //console.log(`Calling check for ${seqName}: User Response is ${userResp}`);
  return SEQUENCES[seqName]['check'](userResp);
}

function callSend(userID, userResp, seqName, options = undefined) {
  let nextState = SEQUENCES[seqName]['analyze'] ? seqName : 'Default'
  setWaitState(userID, nextState);

  // injection hack
  if (seqName === 'Help') {
    userResp = describeSeqs();
  }
  if (userResp === 'PollNotification' || userResp === 'PollInterrupt') {
    userResp = options;
  }

  let error = SEQUENCES[seqName]['send'](userID, userResp);
  if (error) {
    handleError(userID, 'Send', error);
    return;
  }
}

function callAnalyze(userID, userResp, seqName) {
  let sequence = SEQUENCES[seqName];
  let nextSeqs = sequence['nextSeqs'];
  let {nextSeqName, error} = sequence['analyze'](userID, userResp, nextSeqs);

  if (error) {
    handleError(userID, 'Analyze', error);
    return;
  }
  if (nextSeqName) {
    callSend(userID, null, nextSeqName);
  }
}

// If user is Remind, mark as not done; else send a reminder
function handlePollInterrupt(userID, currState, contentInfo) {
  let status = currState === 'Remind' ? 'PollInterrupt' : 'PollNotification';
  contentInfo['interrupt'] = 'true';
  handleSequence(userID, status, 'Default', contentInfo);
}

function handleError(userID, errorType, error) {
  com.sendTextMessage(userID, "I'm afraid I don't understand.\n\nType '*help*' to discover what you can tell me to do.");
  console.log(`[Error: ${errorType}] related to userID: ${userID}`);
  if (error.message !== '') {
    console.log(`- Reason: ${error.message}`);
  }
  saveCurrentEntryToEntry(userID);
  setWaitState(userID, 'Default');
}

function saveCurrentEntryToEntry(userID) {
  try {
    let {err} = db.saveToEntry(userID);
    if (err) throw err;
  } catch(error) {
    // Record analytics here?
    console.log(`[Error: StateSet] related to userID: ${userID}`);
    console.log(`- Reason: ${error.message}`);
  }
}

function setWaitState(userID, nextState) {
  try {

    if (!nextState) throw new Error("setWaitState method's nextState field is undefined.");

    // use Cache here?
    let {err, result} = db.setWaitState(userID, nextState);

    if (err) throw err;

  } catch(error) {
    // Record analytics here?
    console.log(`[Error: StateSet] related to userID: ${userID}`);
    console.log(`- Reason: ${error.message}`);
  }
}
