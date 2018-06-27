module.exports = {
  sendTextMessage: sendTextMessage,
  sendButtonMessage: sendButtonMessage,
  sendQuickReply: sendQuickReply,
  sendImageMessage: sendImageMessage,
  sendPtoEButton: sendPtoEButton
}

const config = require('config');
const request = require('request');
const { promisify } = require('util');

const requestPromise = promisify(request);

const userQueues = {};

// Sends messages to a user in order - one user should only have one syncSendAPI process
function syncSendAPI(recipientId) {
  let userQueue = userQueues[recipientId];
  if (userQueue['messageQueue'].length && userQueue['isIdle']) {
    userQueue['isIdle'] = false;

    let messageData = userQueue['messageQueue'].shift();
    let payload = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: config.get('pageAccessToken') },
        method: 'POST',
        json: messageData
    };

    requestPromise(payload).then(res => {
      if (res.statusCode == 200) {
        let recipientId = res.body ? res.body.recipient_id : '';
        console.log("Successfully sent message to recipient %s", recipientId);
      } else {
        throw new Error('Failed calling Send API.');
      }
    }).catch(error => {
      console.log(`[Error: Send] with message: ${error.message}`);
    }).then(res => {
      userQueue['isIdle'] = true;
      syncSendAPI(recipientId);
    }).catch(error => {
      return;
    });
  }
}

function queueOps(recipientId, messageData) {
  if (!userQueues[recipientId]) {
    userQueues[recipientId] = {
      messageQueue: [],
      isIdle: true
    };
  }
  userQueues[recipientId]['messageQueue'].push(messageData);
  syncSendAPI(recipientId);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
    }
  };

  queueOps(recipientId, messageData);
}

/* Input Format
{
  <TEXT>: <CUSTOM_PAYLOAD>,
  "Choose Virtue": PAYLOADS["VIRTUE"]
}
*/
function sendButtonMessage(recipientId, buttonText, buttonObject) {
  var buttonArray = Object.keys(buttonObject).map(key => {
    return {
      type: "postback",
      title: key,
      payload: buttonObject[key]
    };
  });
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: buttonText,
          buttons: buttonArray
        }
      }
    }
  };

  queueOps(recipientId, messageData);
}

/* Input Format
{
  <TEXT>: <CUSTOM_PAYLOAD>,
  "Choose Virtue": PAYLOADS["VIRTUE"]
}
*/
function sendQuickReply(recipientId, replyText, replyObject) {
  var replyArray = Object.keys(replyObject).map(key => {
    return {
      "content_type": "text",
      "title": key,
      "payload": replyObject[key]
    }
  });
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: replyText,
      quick_replies: replyArray
    }
  };

  queueOps(recipientId, messageData);
}

function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: config.get("serverURL") + "/assets/rift.png"
        }
      }
    }
  };

  queueOps(recipientId, messageData);
}

function sendPtoEButton(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Path to Enlightenment",
          buttons: [{
            type: "web_url",
            url: "https://path-to-enlightenment.firebaseapp.com/",
            title: "Visit Site"
          }]
        }
      }
    }
  };

  queueOps(recipientId, messageData);
}