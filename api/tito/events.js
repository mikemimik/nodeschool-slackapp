'use strict';

const request = require('request-promise');
const logger = require('../../utils/logger').getLogger('debug');
const _ = require('lodash');

class Events {
  constructor (options) {
    if (!options) { throw new Error('missing.param.OPTIONS'); }
    const { defaultRequestOptions, uri } = options;
    if (!uri) { throw new Error('missing.param.URI'); }
    this.resource = 'events';
    this.uri = uri;
    this.requestOptions = defaultRequestOptions;
    logger.silly('Successfully created Ticket resource');
  }

  // NOTE(mperrotte): Posting structure?
  // {
  //   "data":{
  //     "type":"events",
  //     "attributes":{
  //       "slug":"Awesome-conf",
  //       "title":"Awesome Conf"
  //     }
  //   }
  // }

  create (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    
    let { slug } = data;
    const {
      title,
      description = '',
      startDate,
      endDate,
      location = '',
      live = false
    } = data;

    // INFO(mperrotte): incoming param validation
    if (!title) { throw new Error('missing.option.TITLE'); }
    if (!startDate) { throw new Error('missing.option.STARTDATE'); }
    if (!endDate) { throw new Error('missing.option.ENDDATE'); }
    if (!slug) {
      slug = _.kebabCase(title);
    }

    const endpoint = `/${this.resource}`;
    const payload = {
      data: {
        type: this.resource,
        attributes: {
          slug,
          title,
          description,
          'start-date': startDate,
          'end-date': endDate,
          live,
          location
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
      .then((data) => {
        logger.debug('event/create.success:', data);
        return data;
      })
      .catch((err) => {
        logger.error('event/create.error', err);
        throw new Error('event/create.error');
      });
  }
  get (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
  list (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
  update (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
  delete (data) {
    logger.debug('ticket/update:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
}

module.exports = Events;
