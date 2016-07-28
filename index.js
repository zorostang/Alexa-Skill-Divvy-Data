'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('divvystationdata');

var DivvyDataHelper = require('./divvy_data_helper');

app.launch(function(req, res) {
  var prompt = 'For Divvy Station status, tell me a station name.';

  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('divvystationdata', {
  'slots': {
    'STATIONNAME': 'DIVVYSTATIONNAME'
  },

  'utterances': ['{|station|name} {|status} {|info} {|for} {-|STATIONNAME}']
}, function(req, res) {
  // get the slot
  var stationName = req.slot('STATIONNAME');
  var reprompt = 'Tell me a station name to get station status.'

  if (_.isEmpty(stationName)) {
    var prompt = 'I didn\'t hear a station name . Tell me a station name.';

    res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    return true; 
  } else {
    var divvyHelper = new DivvyDataHelper();

    divvyHelper.getStationStatus(stationName).then(function(stationStatus) {

      res.say(divvyHelper.formatStationStatus(stationStatus)).send();
    }).catch(function(err) {

      var prompt = 'I didn\'t find data for station of ' + stationName;

      res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
    });

    return false;
  }
});
module.exports = app;