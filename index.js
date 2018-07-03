'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  express = require('express');

const
  db = require('./src/helpers/database'),
  gateway = require('./src/controllers/gateway'),
  poll = require('./src/controllers/poll'),
  verification = require('./src/controllers/verification');

const
  app = express(),
  port = config.get('port');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.initConnectionObject({
  host: config.get('db_host'),
  user: config.get('db_user'),
  password: config.get('db_password')
});

app.listen(port, function() {
  console.log(`started listening on port ${port}`);
});

app.get('/', function(request, response) {
  response.send('hello world');
  console.log('response sent for /')
});

app.get('/gateway', verification.verifyToken);
app.post('/gateway', gateway.respond);
app.post('/poll', poll.respond);