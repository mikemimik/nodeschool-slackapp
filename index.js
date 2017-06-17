'use strict';

const bodyParser = require('body-parser');
const request = require('request-promise');
const express = require('express');
const moment = require('moment');
const _ = require('lodash');
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
  const { token, team_id, command, text } = body;
  const keys = Object.keys(req);
  // console.log('body:', body);
  // console.log('keys:', keys);

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
    // console.log(`token ${i}:`, token);
    if (!email) email = token[0];
  }

  getLatestEvent()
    .then((data) => {
      console.log('data:', data);
    })
    .then(getCheckinList)
    .then((data) => {
      res.json({ test: 'working' });
    });
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
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


function getLatestEvent() {
  const api = 'https://api.tito.io/v2/nodeschool-toronto';
  const endpoint = '/events';
  const options = {
    method: 'get',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    }
  };
  const callback = function(body) {
    console.log('body:', body);
    const sortedEvents = _.sortBy(
      body.data,
      [
        (event) => {
          const date = event.attributes['start-date'];
          const year = date.split('-')[0];
          return year;
        },
        (event) => {
          const date = event.attributes['start-date'];
          const month = date.split('-')[1];
          return month;
        }
      ]
    );
    const latestEvent = sortedEvents.pop();
    console.log('latestEvent:', latestEvent);
    return latestEvent;
  }
  return request(options).then(callback);
}

function getCheckinList(event) {
  console.log('event:', event);
  const api = 'https://api.tito.io/v2/nodeschool-toronto';
  const endpoint = `/${event.attributes.slug}/checkin_lists`;
  const options = {
    method: 'get',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    }
  };
  const callback = function(body) {
    return body.data[0];
  }
  return request(options).then(callback);
}