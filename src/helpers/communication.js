module.exports = {
  sendTextMessage: sendTextMessage,
  sendLinkMessage: sendLinkMessage,
  sendButtonMessage: sendButtonMessage,
  sendTemplateMessage: sendTemplateMessage,
  sendQuickReply: sendQuickReply,
  sendImageMessage: sendImageMessage,
  sendPtoEButton: sendPtoEButton,
  setProfileAPI: setProfileAPI
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
        uri: 'https://graph.facebook.com/v3.0/me/messages',
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
      console.log(`[Error: Send] with syncSendAPI recursion.`);
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

function sendTextMessage(recipientId, messageText, subscriptionMsg = false) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
    }
  };

  if (subscriptionMsg) {
    addSubscriptionTag(messageData);
  }

  queueOps(recipientId, messageData);
}

function sendLinkMessage(recipientId, messageText, url, subscriptionMsg = false) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: messageText,
          buttons: [{
            type: "web_url",
            url: url,
            title: "Visit Site"
          }]
        }
      }
    }
  };

  if (subscriptionMsg) {
    addSubscriptionTag(messageData);
  }

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
function sendQuickReply(recipientId, replyText, replyObject, subscriptionMsg = false) {
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

  if (subscriptionMsg) {
    addSubscriptionTag(messageData);
  }

  queueOps(recipientId, messageData);
}

function sendImageMessage(recipientId, link, subscriptionMsg = false) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: link
        }
      }
    }
  };

  if (subscriptionMsg) {
    addSubscriptionTag(messageData);
  }

  queueOps(recipientId, messageData);
}

// Refer to: https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic
function sendTemplateMessage(recipientId, templateArray) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: templateArray
        }
      }
    }
  };

  queueOps(recipientId, messageData);
}

function addSubscriptionTag(messageData) {
  messageData['messaging_type'] = "MESSAGE_TAG"
  messageData['tag'] = "NON_PROMOTIONAL_SUBSCRIPTION"
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

// Sets up get started button / persistent menu
function setProfileAPI() {
  let successStatus;
  let payload = {
    uri: `https://graph.facebook.com/v3.0/me/messenger_profile?access_token=${config.get('pageAccessToken')}`,
    method: 'POST',
    json: {
      get_started: {
        payload: "NEW_USER"
      },
      greeting: [{
        locale: 'default',
        text: 'I am a meditation helper.'
      }],
      persistent_menu: [{
        "locale":"default",
        "call_to_actions":[
          {
            "title":"What can I do?",
            "type":"postback",
            "payload": "help"
          },
          {
            "type":"web_url",
            "title":"Visit P2E Website.",
            "url":"https://path-to-enlightenment.firebaseapp.com/",
            "webview_height_ratio":"full"
          }
        ]
      }]
    }
  };
  requestPromise(payload).then(res => {
    if (res.statusCode == 200) {
      successStatus = true;
    } else {
      throw new Error('Failed calling Send API.');
    }
  }).catch(error => {
    console.log('ProfileAPI could not be set.');
    process.exit(1);
  });
}