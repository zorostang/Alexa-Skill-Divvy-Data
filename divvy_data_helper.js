'use strict';

var _ = require('lodash');
var wuzzy = require('wuzzy');
var rp = require('request-promise');
var ENDPOINT = 'https://www.divvybikes.com/stations/json';

var stationMatchingModel = {};

function DivvyDataHelper() {}

// utility function to remove street suffixes returned from Alexa output
// to make matching
// returns given string with street suffix removed

function removeStreetSuffix(string) {
  var streetSuffixes = [
  "street",
  " st ",
  " st",
  "boulevard",
  " blvd ",
  " blvd",
  "place",
  " pl ",
  " pl",
  "court",
  " ct ",
  " ct",
  "terrace",
  " ter ",
  " ter",
  "road",
  " rd ",
  " rd",
  "parkway",
  " pkwy ",
  " pkwy",
  "lane",
  " ln ",
  " ln",
  "drive",
  " dr ",
  " dr",
  "avenue",
  " ave ",
  " ave"
 ];
  streetSuffixes.forEach(function(streetSuffix) {
    string = string.replace(streetSuffix, "");
  });

  return string;
}

function findMatchingStation(stationData) {
  //if no exact match is found then create confidenceArray using wuzzy
  // schema for confidenceObj = {[stationName1, stationName2, etc.],[confidenceScore1, confidenceScore2, etc ]}
  var s = stationMatchingModel;
  s.confidenceArray = [];
  s.confidenceStationsArray = [];

  var match = _.filter(stationData.stationBeanList, function(station) {
    if (s.parsedStationName.length == 2) {
      return station.stationName.toLowerCase()
              .includes(s.parsedStationName[0].toLowerCase()) &&
              station.stationName.toLowerCase()
              .includes(s.parsedStationName[1].toLowerCase());
    } else {
      return station.stationName.toLowerCase()
              .includes(s.parsedStationName[0].toLowerCase());
    }
  });
  
  // match should should return an exact match based on our primitive 
  // matching algorithm
  // if match is undefined then try using wuzzy to find a set of possible
  // matches
  // example: wuzzy(divvyStationName, interpretedStationName)
  
  if (typeof match[0] !== "undefined") { 
    console.log(match[0].stationName, "match[0].stationName");
    return match[0]; 
  }
  
  _.forEach(stationData.stationBeanList, function(station) {
    console.log(removeStreetSuffix(station.stationName.toLowerCase().replace('&','')), s.interpretedStationName.toLowerCase().replace(' and ',''));

    s.confidenceArray.push(wuzzy.jarowinkler(removeStreetSuffix(station.stationName.toLowerCase().replace('&','')), s.interpretedStationName.toLowerCase().replace(' and ','')));
    
    s.confidenceStationsArray.push(station);
  });
  console.log(_.max(s.confidenceArray));
  console.log(_.indexOf(s.confidenceArray,_.max(s.confidenceArray)));
  return s.confidenceStationsArray[_.indexOf(s.confidenceArray,_.max(s.confidenceArray))];
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

// returns the divvy station data for matching station
// findMatchingStation firt looks for exact match, then uses wuzzy to look
// for likely match
DivvyDataHelper.prototype.getStationStatus = function(stationName) {
  var s = stationMatchingModel;
  s.interpretedStationName = removeStreetSuffix(stationName);
  s.parsedStationName = removeStreetSuffix(stationName);
  s.parsedStationName = s.parsedStationName.split(' and ');
  return this.requestNetworkStatus().then(function(res) {
    return findMatchingStation(res);
  });
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
      stationName: '<say-as interpret-as="address">'+ station.stationName.replace(' & ', ' and ') + '</say-as>',
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  } else if (station.availableBikes === 0) {
    return statusEmpty({
      stationName: '<say-as interpret-as="address">'+ station.stationName.replace(' & ', ' and ') + '</say-as>',
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  } else {
    return status({
      stationName: '<say-as interpret-as="address">'+ station.stationName.replace(' & ', ' and ') + '</say-as>',
      numBikes: station.availableBikes,
      numAvailableDocks: station.availableDocks
    });
  }
}

module.exports = DivvyDataHelper;
