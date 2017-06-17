'use strict';

const bodyParser = require('body-parser');
const request = require('request-promise');
const express = require('express');
const lodash = require('lodash');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/checkin', (req, res) => {
  const { params, query, headers, body } = req;
  const { token, team_id, command } = body;
  const keys = Object.keys(req);
  console.log('body:', body);
  console.log('keys:', keys);

  if (
    process.env.SLACKAPP_TOKEN !== token ||
    process.env.SLACKAPP_TEAMID !== team_id ||
    command !== '/checkin'
  ) {
    res.json({ text: 'something went wrong.'});
  }

  const emailRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
  let email;
  for (let token, i = 0; (token = emailRegex.exec(text)) !== null; i++) {
    if (token.index === emailRegex.lastIndex) emailRegex.lastIndex++;   
    console.log(`token ${i}:`, token);
    if (!email) email = token[0];
  }

  /**
   * {
   *  text: "some reply",
   *  attachments: [
   *    {
   *      text: "looks like quoted text"
   *    }
   *  ]
   * }
   */
  res.end();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
