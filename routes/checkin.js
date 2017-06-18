'use strict';

const express = require('express');
const request = require('request-promise');
const titoApi = require('../api/tito');

const router = express.Router();

router.route('/')
  .post((req, res, next) => {
    const { params, query, headers, body } = req;
    const { token, team_id, command, text, response_url } = body;
    const keys = Object.keys(req);

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
      if (!email) email = token[0];
    }

    // INFO(mperrotte): basically a state object to hold response data from tito
    const data = {};

    // INFO(mperrotte): send initial response back to slack user
    res.status(200).end();

    titoApi.getLatestEvent()
      .then((event) => {
        data.event = event;
        return titoApi.getCheckinList(event);
      })
      .then((checkinList) => {
        data.checkinList = checkinList;
        return titoApi.getTicket(data.event, email);
      })
      .then((ticket) => {
        data.ticket = ticket;
        return titoApi.checkInUser(data);
      })
      .then((checkinResponse) => {
        console.log('checkinResponse:', checkinResponse);
        return handleSlackResponse(null, data, response_url);
      })
      .catch((err) => {
        console.log('caught error:', err);
    });
  });

module.exports = router;

// HELPER FUNCTIONS
function handleSlackResponse(err, data, response_url) {
  let mainText = 'Successfully Checked In';
  const attachments = [];
  attachments.push({text: `${data.event.attributes.title} Event`});
  if (err) {
    mainText = 'Failed Check In';
  }
  const payload = {
      text: mainText,
      attachments,
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