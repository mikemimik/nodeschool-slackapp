'use strict';

const express = require('express');
const router = express.Router();
const linkData = require('./link-data');
const _ = require('lodash');

router.route('/')
  .post((req, res, next) => {
    const { params, query, headers, body } = req;
    const { token, team_id, command, text, response_url } = body;
    if (
      process.env.SLACKAPP_TOKEN !== token ||
      process.env.SLACKAPP_TEAMID !== team_id ||
      command !== '/links'
    ) {
      return res.json({ text: 'Something went wrong.'});
    }


    const mainText = 'Some useful NodeSchool Links';
    const attachments = Object.keys(linkData).map((linkName) => {
      const author_name = linkName.replace(/-/g, ' ');
      const data = {
        author_name
      };
      const output = _.merge(linkData[linkName], data);
      return output;
    });
    const payload = {
      text: mainText,
      attachments,
    };
    // INFO(mperrotte): send initial response back to slack user
    res.json(payload);
  });

module.exports = router;
