'use strict';

var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://www.divvybikes.com/stations/json';

function DivvyDataHelper() {}

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
  return this.requestNetworkStatus().then(
    function(res) {
      
      var station = _.find(res.stationBeanList, function(o) {
        return o.stationName === stationName;
      });
      return station.statusValue;
    }
  )
}

module.exports = DivvyDataHelper;
