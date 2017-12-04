'use strict';

const express = require('express');
const request = require('request-promise');
const titoApi = require('../api/tito');
const logger = require('../utils/logger').getLogger('debug');

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
      return res.json({ text: 'Something went wrong.'});
    }

    const emailRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
    let email;
    for (let token, i = 0; (token = emailRegex.exec(text)) !== null; i++) {
      if (token.index === emailRegex.lastIndex) emailRegex.lastIndex++;   
      if (!email) email = token[0];
    }

    // INFO(mperrotte): bail if no email
    if (!email) {
      return res.json({ text: 'No email supplied.' });
    }

    // INFO(mperrotte): basically a state object to hold response data from tito
    const data = {};

    // INFO(mperrotte): send initial response back to slack user
    res.status(200).end();

    titoApi.getLatestEvent()
      .then((event) => {
        logger.debug('Latest event:', event);
        data.event = event;
        return titoApi.getCheckinList(event);
      })
      .then((checkinList) => {
        logger.debug('Checkin List:', checkinList);
        data.checkinList = checkinList;
        return titoApi.getTicket(data.event, email);
      })
      .then((ticket) => {
        logger.debug('Ticket:', ticket);
        data.ticket = ticket;
        return titoApi.checkInUser(data);
      })
      .then((checkinResponse) => {
        logger.info('checkinReponse:', checkinResponse);
        return handleSlackResponse(null, data, response_url);
      })
      .catch((err) => {
        logger.error('caught error:', err);
        return handleSlackResponse(err, {}, response_url);
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
    logger.info('slackResponse:', slackResponse);
    logger.debug(`Check In: ${data.ticket.attributes.name}`);
  });
}