module.exports = {
  sendTextMessage: sendTextMessage,
  sendButtonMessage: sendButtonMessage,
  sendQuickReply: sendQuickReply,
  sendImageMessage: sendImageMessage,
  sendPtoEButton: sendPtoEButton
}

const config = require('config');
const request = require('request');

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: config.get('pageAccessToken') },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
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

  callSendAPI(messageData);
}

/* Input Format
{
  <TEXT>: <CUSTOM_PAYLOAD>,
  "Choose Virtue": PAYLOADS["VIRTUE"]
}
*/
function sendButtonMessage(recipientId, buttonText, buttonObject) {
  buttonArray = Object.keys(buttonObject).map(key => {
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

  callSendAPI(messageData);
}

/* Input Format
{
  <TEXT>: <CUSTOM_PAYLOAD>,
  "Choose Virtue": PAYLOADS["VIRTUE"]
}
*/
function sendQuickReply(recipientId, replyText, replyObject) {
  replyArray = Object.keys(replyObject).map(key => {
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

  callSendAPI(messageData);
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

  callSendAPI(messageData);
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

  callSendAPI(messageData);
}