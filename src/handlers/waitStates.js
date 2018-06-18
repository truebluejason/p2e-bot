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
  Help: {
    check: checkHelp, // User asks for help and passes check - State is default so eval send function
    send: sendHelp, // Bot sends user help and doesn't expect a reply
    isBeginning: true,
    expectReply: false,
    afterWait: null,
    nextSeqs: null
  },
  Remind: {
    check: checkRemind, // Poll update = State is default so eval send function
    send: sendRemind, // Bot sends user reminder and expects a reply
    isBeginning: true,
    expectReply: true,
    afterWait: analyzeRemind, // Bot saves 'Done' or 'NotDone' status and eval checks for nextSeqs - State not default so don't eval current send
    nextSeqs: [ "Options", "NotDoneReason" ] // Upon being selected, eval nextSeq's send function
  },
  Options: {
    check: checkOptions,
    send: sendOptions, // Bot tells user to choose between virtues and hindrances
    isBeginning: false,
    expectReply: true,
    afterWait: analyzeOptions, // Bot saves 'choice' and eval checks for nextSeqs - State not default so don't eval current send
    nextSeqs: [ "Virtues", "Hindrances" ] // Upon being selected, eval nextSeq's send function
  },
  Virtues: {
    check: checkVirtues,
    send: sendVirtues, // Bot tells user to choose from virtue list
    isBeginning: false,
    expectReply: true,
    afterWait: analyzeVirtues, // Bot saves 'choice' and eval checks for nextSeqs - State not default so don't eval current send
    nextSeqs: [ "CreatePlan" ] // Upon being selected, eval nextSeq's send function
  },
  Hindrances: {
    check: checkHindrances,
    send: sendHindrances, // Bot tells user to choose from virtue list
    isBeginning: false,
    expectReply: true,
    afterWait: analyzeHindrances, // Bot saves 'choice' and eval checks for nextSeqs - State not default so don't eval current send
    nextSeqs: [ "CreatePlan" ] // Upon being selected, eval nextSeq's send function
  },
  CreatePlan: {
    check: checkCreatePlan,
    send: sendCreatePlan, // Bot tells user to write plan
    isBeginning: false,
    expectReply: true,
    afterWait: analyzeCreatePlan, // Bot saves 'entry' and eval checks for nextSeqs - State not default so don't eval current send
    nextSeqs: [ "GoodJob" ] // Upon being selected, eval nextSeq's send function
  },
  GoodJob: {
    check: checkGoodJob,
    send: sendGoodJob, // Bot tells user good job
    isBeginning: false,
    expectReply: false,
    afterWait: null,
    nextSeqs: null
  },
  

}

/*
check function: (userResp, seqName) => boolean
send function: (userID, userResp, seqName) => boolean - if userResp is null, don't bother analyzing
afterWait function: (userID, userResp, seqName) => boolean
*/

const BEGINNING_SEQS = getBeginningSeqs();

// Upon server starting, return an array of beginning sequence keys (sequences that start from default)
function getBeginningSeqs() {
  return Object.keys(SEQUENCES).filter(seqName => !!SEQUENCES[seqName]['isBeginning']);
}

function handleSequence(userID, userResp, currState) {
  if (currState === 'Default') {
    let seqName = BEGINNING_SEQS.filter(seqName => callCheck(seqName, userResp))[0];
    if (seqName === undefined) {
      handleError(userID, 'Check', new Error('No matching check function for user response.'));
      return;
    }
    callSend(userID, userResp, seqName);
  } else {
    callAfterWait(userID, userResp, currState);
  }
}

function callCheck(userResp, seqName) {
  return SEQUENCES[seqName]['check'](userResp);
}

function callSend(userID, userResp, seqName) {
  let error = SEQUENCES[seqName]['send'](userID, userResp);
  if (error !== null) {
    handleError(userID, 'Send', error);
    return;
  }
  setWaitState(userID, seqName);
}

function callAfterWait(userID, userResp, seqName) {
  let sequence = SEQUENCES[seqName];
  let nextSeqs = sequence['nextSeqs'];
  let {nextSeqName, error} = sequence['afterWait'](userID, nextSeqs);
  if (error !== null) {
    handleError(userID, 'AfterWait', error);
    return;
  }
  callSend(userID, null, nextSeqName);
}

function handleError(userID, errorType, error) {
  com.sendTextMessage(userID, "I don't understand.");
  console.log(`[Error: ${errorType}] related to userID: ${userID}`);
  if (reason !== '') {
    console.log(`- Reason: ${reason}`);
  }
  setWaitState(userID, 'Default');
}

function setWaitState(userID, nextState) {
  try {

    if (!nextState) {
      throw new Error("setWaitState method's nextState field is undefined.");
    }
    // use Cache here?
    db.setWaitState(userID, nextState);

  } catch(error) {
    // Record analytics here?
    console.log(`[Error: StateSet] related to userID: ${userID}`);
    console.log(`- Reason: ${error.message}`);
  }
}
