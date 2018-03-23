'use strict';

const request = require('request-promise');
const logger = require('../../utils/logger').getLogger('debug');
const _ = require('lodash');

class CheckinList {
  constructor (options) {
    if (!options) { throw new Error('missing.param.OPTIONS'); }
    const { defaultRequestOptions, uri } = options;
    if (!uri) { throw new Error('missing.param.URI'); }
    this.resource = 'checkin_list';
    this.uri = uri;
    this.requestOptions = defaultRequestOptions;
    logger.silly('Successfully created CheckinList resource');
  }

  // NOTE(mperrotte): Posting structure?
  // {
  //   "data":{
  //     "type":"checkin-lists",
  //     "attributes":{
  //       "title":"Day 2 Check-in List"
  //     }
  //   }
  // }

  create (data) {
    logger.debug('checkList/create.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const {
      activityIds,
      expiresAt,
      questionIds,
      releaseIds,
      showCompanyName = false,
      showEmail = true,
      showPhoneNumber = false,
      title
    } = data;

    // INFO(mperrotte): incoming param validation
    
    if (!title) { throw new Error('missing.option.TITLE'); }

    const endpoint = `/${event.attributes.slug}/${this.resource}`;
  }

  get (data) {
    logger.debug('checkinList/get.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const { event, checkinList } = data;

    // INFO(mperrotte): incoming param validation
    if (!event) { throw new Error('missing.option.EVENT'); }
    if (!checkinList) { throw new Error('missing.option.CHECKINLIST'); }
    if (event && !event.attributes) {
      throw new Error('missing.option.EVENT:ATTRIBUTES');
    }
    if (checkinList && !checkinList.slug) {
      throw new Error('missing.option.CHECKINLIST:SLUG');
    }

    const endpoint = `/${event.attributes.slug}/${this.resource}/${checkinList.slug}`;
    const options = {
      method: 'get',
      url: this.uri + endpoint
    };
    return request(_.merge(this.requestOptions, options))
      .then((res) => {
        logger.debug('checkinList/get.success:', res);
        return res;
      })
      .catch((err) => {
        logger.error('checkinList/get.error:', err);
        throw new Error('checkinList/get.error');
      });
  }

  list (data) {
    logger.debug('checkinList/list.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    const { event } = data;

    // INFO(mperrotte): incoming param validation
    if (!event) { throw new Error('missing.option.EVENT'); }
    if (event && !event.attributes) {
      throw new Error('missing.option.EVENT:ATTRIBUTES');
    }

    const endpoint = `/${event.attributes.slug}/${this.resource}`;
    const options = {
      method: 'get',
      url: this.uri + endpoint
    };
    return request(_.merge(this.requestOptions, options))
      .then((res) => {
        logger.debug('checkinList/list.success:', res);
        return res;
      })
      .catch((err) => {
        logger.error('checkinList/list.error:', err);
        throw new Error('checkinList/list.error'):
      });
  }

  update (data) {
    logger.debug('checkinList/update.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }

  delete (data) {
    logger.debug('checkinList/delete.entry:', data);

    // INFO(mperrotte): initial param validation
    if (!data) { throw new Error('missing.param.DATA'); }
    throw new Error('not.implemented');
  }
}

module.exports = CheckinList;
