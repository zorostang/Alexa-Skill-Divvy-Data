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
            stationName: station.stationName,
            numBikes: station.availableBikes,
            numAvailableDocks: station.availableDocks
        });
    } else if (station.availableBikes === 0) {
        return statusEmpty({
            stationName: station.stationName,
            numBikes: station.availableBikes,
            numAvailableDocks: station.availableDocks
        });
    } else {
        return status({
            stationName: station.stationName,
            numBikes: station.availableBikes,
            numAvailableDocks: station.availableDocks
        });
    }
}

module.exports = DivvyDataHelper;
