'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = chai.expect;

var DivvyDataHelper = require('../divvy_data_helper');

chai.config.includeStack = true;


describe('DivvyDataHelper', function() {
  var subject = new DivvyDataHelper();
  var stationName;

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

        stationName = 'Peoria St & Jackson Blvd';
        //var value = subject.getStationStatus(stationName);
        var value = subject.getStationStatus(stationName).then(function(res) {
          return res;
        });

        return expect(value).to.eventually.be.a('string'); //should be "In Service or Not In Service"
      });
    });
  });

  describe('#formatStationStatus', function() {
    var station = {
      "id": 134,
      "stationName": "Peoria St & Jackson Blvd",
      "availableDocks": 14,
      "totalDocks": 19,
      "latitude": 41.877749,
      "longitude": -87.649633,
      "statusValue": "In Service",
      "statusKey": 1,
      "status": "IN_SERVICE",
      "availableBikes": 4,
      "stAddress1": "Peoria St & Jackson Blvd",
      "stAddress2": "",
      "city": "Chicago",
      "postalCode": "",
      "location": "",
      "altitude": "",
      "testStation": false,
      "lastCommunicationTime": "2016-07-06 15:52:32",
      "landMark": "158",
      "is_renting": true
    };

    // 1 or more docks and 1 or more bikes
    context('with a status of IN_SERVICE and one or more available docks and 1 or more bikes', function() {
      it('formats the status as expected', function() {
        station.status = "IN_SERVICE";
        station.availableDocks = 10;
        station.availableBikes = station.totalDocks - station.availableDocks;

        expect(subject.formatStationStatus(station)).to.eq('There are 10 available docks and 9 available bikes at Peoria St & Jackson Blvd');
      });
    });

    // 0 avaiable docks
    context('with a status of IN_SERVICE and 0 availableDocks', function() {
      it('formats the status as expected', function() {
        station.status = "IN_SERVICE";
        station.availableDocks = 0;
        station.availableBikes = station.totalDocks - station.availableDocks;

        expect(subject.formatStationStatus(station)).to.eq('Peoria St & Jackson Blvd is full. There are 19 bikes and 0 available docks.');
      });
    });

    // 0 available bikes
    context('with a status of IN_SERVICE and 0 available bikes', function() {
      it('formats the status as expected', function() {
        station.status = "IN_SERVICE";
        station.availableBikes = 0;
        station.availableDocks = station.totalDocks;

        expect(subject.formatStationStatus(station)).to.eq('Peoria St & Jackson Blvd is empty. There are 0 bikes and 19 available docks.');
      });
    });
  });
});
