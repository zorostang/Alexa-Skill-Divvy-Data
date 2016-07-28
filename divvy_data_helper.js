'use strict';

var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://www.divvybikes.com/stations/json';
var parsedStationName;

function DivvyDataHelper() {}

// utility function to remove street suffixes returned from Alexa output
// to make matching
// returns given string with street suffix removed

function removeStreetSuffix(string) {
  var streetSuffixes = [
  "street",
  "boulevard",
  "place",
  "court",
  "terrace",
  "road",
  "parkway",
  "lane",
  "drive"
 ];
  streetSuffixes.forEach(function(streetSuffix) {
    string = string.replace(streetSuffix, "");
  });

  return string;
}

var findMatchingStation = function(stationData) {
  var match = _.filter(stationData.stationBeanList, function(station) {
    if (parsedStationName.length == 2) {
      return station.stationName.toLowerCase()
              .includes(parsedStationName[0].toLowerCase()) &&
              station.stationName.toLowerCase()
              .includes(parsedStationName[1].toLowerCase());
    } else {
      return station.stationName.toLowerCase()
              .includes(parsedStationName[0].toLowerCase());
    }
  });
  
  return match[0];
}

DivvyDataHelper.prototype.requestNetworkStatus = function() {
    return this.getNetworkStatus().then(
        function(res) {
            return res.body
        }
    )
};

DivvyDataHelper.prototype.getNetworkStatus = function() {
    var options = {
        method: 'GET',
        uri: ENDPOINT,
        resolveWithFullResponse: true,
        json: true
    };
    return rp(options);
}

DivvyDataHelper.prototype.getStationStatus = function(stationName) {
  parsedStationName = removeStreetSuffix(stationName);
  parsedStationName = parsedStationName.split(' and ');
  return this.requestNetworkStatus().then(findMatchingStation)
}

DivvyDataHelper.prototype.formatStationStatus = function(station) {
  // 1. station is full (0 docks available)
  // 2. station is empty (0 bikes available)
  // 3. station is not full (1 or more docks available)
  // 4. station is not in service

  if (station.status !== "IN_SERVICE") {
    return "That station is currently out of service."
  }

  var statusFull = _.template('${stationName} is full. There are ${numBikes} bikes and ${numAvailableDocks} available docks.');

  var statusEmpty = _.template('${stationName} is empty. There are ${numBikes} bikes and ${numAvailableDocks} available docks.');

  var status = _.template('There are ${numAvailableDocks} available docks and ${numBikes} available bikes at ${stationName}');

  if (station.availableDocks === 0) {
    return statusFull({
      stationName: station.stationName.replace(' & ', ' and '),
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  } else if (station.availableBikes === 0) {
    return statusEmpty({
      stationName: station.stationName.replace(' & ', ' and '),
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  } else {
    return status({
      stationName: station.stationName.replace(' & ', ' and '),
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  }
}

module.exports = DivvyDataHelper;
