'use strict';

const express = require('express');
const request = require('request-promise');
const titiApi = require('../api/tito');
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
      command !== '/register'
    ) {
      return res.json({ text: 'Something went wrong.'});
    } else {
      console.log(req);
      return res.json({ text: 'Successful test.' });
    }

    // INFO(mperrotte): basically a state object to hold response data from tito
    const data = {};

    // INFO(mperrotte): send initial response back to slack user
    res.status(200).end();

    titoApi.getLatestEvent()
      .then((event) => {
        logger.debug('Latest event:', event);
        // const date = (event.attributes['start-date'])
        //   ? event.attributes['start-date']
        //   : event.attributes['end-date'];
        // const year = (datd) : date.split('-')[0] : null;
        // const month = (date) : date.split('-')[1] : null;
        // if (!year || !month) throw new Error('Error getting latest event');
        // return titoApi.createEvent(month - 1, year)
        return createTicket(month)
      })
      .then(() => {

      });
  });

module.exports = router;