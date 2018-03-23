'use strict';

const request = require('request-promise');
const logger = require('../../utils/logger').getLogger('debug');
const _ = require('lodash');

class Tickets {
  consructor (options) {
    if (!options) { throw new Error('missing.param.OPTIONS'); }
    const { defaultRequestOptions, uri } = options;
    if (!uri) { throw new Error('missing.param.URI'); }
    this.resource = 'tickets';
    this.uri = uri;
    this.requestOptions = defaultRequestOptions;
    logger.silly('Successfully created Ticket resource');
  }

  // NOTE(mperrotte): Posting structure?
  // {
  //   "data":{
  //     "type":"tickets",
  //     "attributes":{
  //       "email":"joe.bloggs@example.com"
  //     },
  //     "relationships":{
  //       "release":{
  //         "data":{
  //           "type":"releases",
  //           "id":"awesomeconf-ticket"
  //         }
  //       }
  //     }
  //   }
  // }

  create (data) {
    logger.debug('ticket/create.entry', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const {
      // answers, // needed for tickets that have questions attached
      event,
      release,
      user
    } = data;

    // INFO(mperrotte): incoming param validation
    if (!user) { throw new Error('missing.option.USER'); }
    if (user && !user.email) { throw new Error('missing.option.USER:EMAIL'); }
    if (user && !user.name) { throw new Error('missing.option.USER:NAME'); }
    if (!event) { throw new Error('missing.option.EVENT'); }
    if (event && !event.attributes) {
      throw new Error('missing.option.EVENT:ATTRIBUTES');
    }
    if (!release) { throw new Error('missing.option.RELEASE'); }
    if (release && !release.id) {
      throw new Error('missing.option.RELEASE:ID'):
    }

    const { email, name } = user;
    const endpoint = `/${event.attributes.slug}/${this.resource}`;
    const payload = {
      data: {
        type: this.resource,
        attributes: {
          email,
          name,
          notify: true
        },
        relationships: {
          release: {
            data: {
              type: 'releases',
              id: release.id
            }
          }
        }
      }
    };
    const options = {
      method: 'post',
      url: this.uri + endpoint,
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return request(_.merge(this.requestOptions, options))
      .then((res) => {
        logger.debug('ticket/create.success:', res);
        return res;
      })
      .catch((err) => {
        logger.error('ticket/create.error:', err);
        throw new Error('ticket/create.error');
      });
  }

  get (data) {
    logger.debug('ticket/get.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const { event, ticketId } = data;

    // INFO(mperrotte): incoming param validation
    if (!event) { throw new Error('missing.option.EVENT'); }
    if (event && !event.attributes) {
      throw new Error('missing.option.EVENT:ATTRIBUTES');
    }
    if (!ticketId) { throw new Error('missing.option.TICKETID'); }

    const endpoint = `/${event.attributes.slug}/${this.resource}/${ticketId}`;
    const options = {
      method: 'get',
      url: this.uri + endpoint
    };
    return request(_.merge(this.requestOptions, options))
      .then((res) => {
        logger.debug('ticket/get.success:', res);
        return res;
      })
      .catch((err) => {
        logger.error('ticket/get.error:', err);
        throw new Error('ticket/get.error');
      });
  }

  list (data) {
    logger.debug('ticket/list.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const { event } = data;

    // INFO(mperrotte): incoming param validation
    if (!event) { throw new Error('missing.option.EVENT'); }
    if (event && !event.attributes) {
      throw new Error('missing.option.EVENT:ATTRIBUTES');
    }

    const endpoint = `/${event.attributes.slug}/${this.resource}`
    const options = {
      method: 'get',
      url: this.uri + endpoint
    };
    return request(_.merge(this.requestOptions, options))
      .then((res) => {
        logger.debug('ticket/list.success:', res);
        return res;
      })
      .catch((err) => {
        logger.error('ticket/list.error:', err);
        throw new Error('ticket/list.error');
      });
  }

  update (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
  delete (data) {
    logger.debug('ticket/delete.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
}

module.exports = Tickets;
