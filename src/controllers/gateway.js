const com = require('../helpers/communication.js');
const db = require('../helpers/database.js');

function receivedMessage(event) {
  var senderID = event.sender.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, timeOfMessage);

  if (message.text) {
    var messageText = message.text;
    com.sendTextMessage(senderID, messageText);
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  com.sendTextMessage(senderID, "Postback called");
}

function receivedMessageRead(event) {
  console.log("Message has been read.");
}

function respond(req, res) {
  const data = req.body;
  if (data.object === 'page') {
    console.log(JSON.stringify(data.entry));
    data.entry.forEach(pageEntry => {
      pageEntry.messaging.forEach(msgEvent => {
        if (msgEvent.message) {
          receivedMessage(msgEvent);
        } else if (msgEvent.postback) {
          receivedPostback(msgEvent);
        } else if (msgEvent.read) {
          receivedMessageRead(msgEvent);
        }
      });
    });
    res.status(200).send('Event received');
  }
};

exports.respond = respond;
