'use strict';

const proxyquire = require('proxyquire').noCallThru();
const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');

describe('TITO API', function() {
  describe('Module Exports', function() {
    let titoApi;
    let fixtures;

    beforeEach(function() {
      const requestStub = (options) => {
        // console.log('options:', options);
        console.log('fixtures:', fixtures);

        return sinon.stub().resolves(fixtures)();
      };
      
      titoApi = proxyquire('../../api/tito', {
        'request-promise': requestStub
      });
    });

    describe('getLatestEvent', function() {
      fixtures = {
        data: [
          {
            id: 'event-name',
            type: 'events',
            attributes: { slug: 'event-name-slug', 'start-date': '2017-01-01' }
          },
          {
            id: 'event-name',
            type: 'events',
            attributes: { slug: 'event-name-slug', 'start-date': '2016-01-01' }
          },
          {
            id: 'event-name',
            type: 'events',
            attributes: { slug: 'event-name-slug', 'start-date': '2017-05-01' }
          }
        ]
      };

      it('Should return the lastest event', function() {
        const expectedEvent = _.sortBy(
          fixtures.data,
          [
            (event) => {
              const date = event.attributes['start-date'];
              const year = date.split('-')[0];
              return year;
            },
            (event) => {
              const date = event.attributes['start-date'];
              const year = date.split('-')[1];
              return year;
            }
          ]
        ).pop();
        return titoApi.getLatestEvent().then(event => {
          expect(event).to.be.an('object');
          expect(event.attributes['start-date']).to.be.deep.equal(expectedEvent.attributes['start-date']);
        });
      });
    });
  });
});