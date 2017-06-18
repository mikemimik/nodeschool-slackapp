'use strict';

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('TITO API', function() {
    let requestStub;
    let titoApi;

    beforeEach(function() {
        requestStub = sinon.stub().resolves({});
        titoApi = proxyquire('../../api/tito', {
            'request-promise': requestStub
        });
    });
    describe('Module Exports', function() {
        describe('getLatestEvent', function() {

            return titoApi.getLatestEvent().then(event => {

            });
        });
    });
});