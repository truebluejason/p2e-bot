'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  express = require('express');

const
  gateway = require('./src/controllers/gateway.js'),
  verification = require('./src/controllers/verification.js');

const
  app = express(),
  port = config.get('port');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, function() {
  console.log(`started listening on port ${port}`);
});

app.get('/', function(request, response) {
  response.send('hello world');
  console.log('response sent for /')
});

app.get('/gateway', verification.verifyToken);
app.post('/gateway', gateway.respond);