'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = chai.expect;

var DivvyDataHelper = require('../divvy_data_helper');

chai.config.includeStack = true;


describe('DivvyDataHelper', function() {

  var subject = new DivvyDataHelper();

  describe('#getNetworkStatus', function() {
    it('returns Divvy Network Status', function() {

      var value = subject.requestNetworkStatus().then(function(res) {
        return res.executionTime;
      });

      return expect(value).to.eventually.be.a("string");
    });
  });

  describe('#getStationStatus', function() {
    context('with a valid stationName', function() {
      it('returns the status of the given station', function() {

        var stationName = 'Peoria St & Jackson Blvd';
        //var value = subject.getStationStatus(stationName);
        var value = subject.getStationStatus(stationName).then(function(res) {
          return res;
        });

        return expect(value).to.eventually.be.a('string'); //should be "In Service or Not In Service"
      });
    });
  });
});
