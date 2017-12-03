'use strict';

const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');
const logger = require('../utils/logger').getLogger('debug');

const api = 'https://api.tito.io/v2/nodeschool-toronto';
const defaultOptions = {
  headers: {
    'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
    'Accept': 'application/vnd.api+json'
  },
  json: true
};

module.exports.getLatestEvent = function() {
  const endpoint = '/events';
  const options = {
    method: 'get',
    url: api + endpoint
  };
  const callback = function(body) {
    const sortedEvents = _.chain(body.data)
      .filter((event) => (event['start-date'] || event['end-date']))
      .sortBy(
        [
          (event) => {
            const date = (event.attributes['start-date'])
              ? event.attributes['start-date']
              : event.attributes['end-date'];
            const year = (date) ? date.split('-')[0] : null;
            if (!year) logger.debug('Event Attributes:', event.attributes);
            return year;
          },
          (event) => {
            const date = (event.attributes['start-date'])
              ? event.attributes['start-date']
              : event.attributes['end-date'];
            const month = (date) ? date.split('-')[1] : null;
            if (!month) logger.debug('Event Attributes:', event.attributes);
            return month;
          }
        ]
      );
    const latestEvent = sortedEvents.pop();
    return latestEvent;
  }
  return request(_.merge(defaultOptions, options)).then(callback);
}

module.exports.getCheckinList = function(event) {
  const endpoint = `/${event.attributes.slug}/checkin_lists`;
  const options = {
    method: 'get',
    url: api + endpoint
  };
  const callback = function(body) {
    return body.data[0];
  }
  return request(_.merge(defaultOptions, options)).then(callback);
}

module.exports.getTicket = function(event, email) {
  const endpoint = `/${event.attributes.slug}/tickets`;
  const options = {
    method: 'get',
    url: api + endpoint
  };
  const callback = function(body) {
    const tickets = body.data;
    const ticket = _.find(tickets, (ticket) => {
      return ticket.attributes.email === email;
    });
    return ticket;
  };
  return request(_.merge(defaultOptions, options)).then(callback);
}

module.exports.checkInUser = function(data) {
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
    body: payload
  };
  return request(_.merge(defaultOptions, options)).then((data) => data);
}