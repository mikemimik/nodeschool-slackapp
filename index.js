'use strict';

const bodyParser = require('body-parser');
const request = require('request-promise');
const express = require('express');
const moment = require('moment');
const _ = require('lodash');
const app = express();

const api = 'https://api.tito.io/v2/nodeschool-toronto';

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/checkin', (req, res) => {
  const { params, query, headers, body } = req;
  const { token, team_id, command, text, response_url } = body;
  const keys = Object.keys(req);
  // console.log('body:', body);
  // console.log('keys:', keys);

  if (
    process.env.SLACKAPP_TOKEN !== token ||
    process.env.SLACKAPP_TEAMID !== team_id ||
    command !== '/checkin'
  ) {
    return res.json({ text: 'something went wrong.'});
  }

  const emailRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
  let email;
  for (let token, i = 0; (token = emailRegex.exec(text)) !== null; i++) {
    if (token.index === emailRegex.lastIndex) emailRegex.lastIndex++;   
    // console.log(`token ${i}:`, token);
    if (!email) email = token[0];
  }

  const data = {};
  res.status(200).end();
  getLatestEvent()
    .then((event) => {
      data.event = event;
      return getCheckinList(event);
    })
    .then((checkinList) => {
      data.checkinList = checkinList;
      return getTicket(data.event, email);
    })
    .then((ticket) => {
      data.ticket = ticket;
      return checkInUser(data);
    })
    .then((checkinResponse) => {
      console.log('checkinResponse:', checkinResponse);
      return handleSlackResponse(null, data);
    })
    .catch((err) => {
      console.log('caught error:', err);
    });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


function getLatestEvent() {
  const endpoint = '/events';
  const options = {
    method: 'get',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    },
    json: true
  };
  const callback = function(body) {
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
    return latestEvent;
  }
  return request(options).then(callback);
}

function getCheckinList(event) {
  const endpoint = `/${event.attributes.slug}/checkin_lists`;
  const options = {
    method: 'get',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    },
    json: true
  };
  const callback = function(body) {
    return body.data[0];
  }
  return request(options).then(callback);
}

function getTicket(event, email) {
  const endpoint = `/${event.attributes.slug}/tickets`;
  const options = {
    method: 'get',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    },
    json: true
  };
  const callback = function(body) {
    const tickets = body.data;
    const ticket = _.find(tickets, (ticket) => {
      return ticket.attributes.email === email;
    });
    return ticket;
  };
  return request(options).then(callback);
}

function checkInUser(data) {
  const event = data.event.attributes.slug;
  const checkinList = data.checkinList.id;
  const ticket = data.ticket.id;
  const endpoint = `/${event}/checkin_lists/${checkinList}/checkins`;
  const payload = {
      data: {
          type: "checkins",
          attributes: {
              'created-at': moment().format()
          },
          relationships: {
              'checkin-list': {
                  data: {
                      type: "checkin-lists",
                      id: checkinList
                  }
              },
              ticket: {
                  data: {
                      type: "tickets",
                      id: ticket
                  }
              }
          }
      }
  };
  const options = {
    method: 'post',
    url: api + endpoint,
    headers: {
      'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
      'Accept': 'application/vnd.api+json'
    },
    json: true,
    body: payload
  };
  return request(options).then((data) => data);
}

function handleSlackResponse(err, data) {
  let mainText = 'Successfully Checked In';
  const attachments = [];
  attachments.push({text: `${data.event.attributes.title} Event`});
  if (err) {
    mainText = 'Failed Check In';
  }
  const payload = {
      text: mainText,
      attachments: [
        {
          text: `${data.event.attributes.title} Event`
        }
      ]
    };
    const options = {
      method: 'post',
      url: response_url,
      json: true,
      body: payload
    }
    return request(options).then((slackResponse) => {
      console.log('slackResponse:', slackResponse);
      console.log(`Check In: ${data.ticket.attributes.name}`);
    });
}