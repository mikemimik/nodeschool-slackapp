'use strict';

const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');

const api = 'https://api.tito.io/v2/nodeschool-toronto';
const defaultOptions = {
  headers: {
    'Authorization': `Token token=${process.env.SLACKAPP_TITO_API_KEY}`,
    'Accept': 'application/vnd.api+json'
  },
  json: true
};

module.exports.getLastestEvent = function getLatestEvent() {
  const endpoint = '/events';
  const options = {
    method: 'get',
    url: api + endpoint
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
  return request(_.merge(defaultOptions, options)).then(callback);
}

module.exports.getCheckinList = function getCheckinList(event) {
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

function getTicket(event, email) {
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

module.exports.checkInUser = function checkInUser(data) {
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