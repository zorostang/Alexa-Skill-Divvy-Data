'use strict';

module.change_code = 1;

var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('divvystationdata');
var DivvyDataHelper = require('./divvy_data_helper');
// var outputSpeach = {
//     "type": "SSML",
//     "ssml": "<speak>" + prompt + "</speak>"
// };

app.launch(function(req, res) {
  var prompt = 'For Divvy Station status, tell me a station name.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('divvystationdata', {
  'slots': {
    'STATIONNAME': 'DIVVYSTATIONNAME'
  },

  'utterances': ['{to check on|to check on the|for|about} status {|for|at|of} {-|STATIONNAME}', '{to check on|for|about} {-|STATIONNAME}']
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
      console.log(stationStatus);
      res.say(divvyHelper.formatStationStatus(stationStatus)).shouldEndSession(true).send();
    }).catch(function(err) {
      var prompt = 'I didn\'t find data for station of' + 
      '<say-as interpret-as="address">' + stationName + '</say-as>';
      var reprompt = 'Try asking again';
      res.say(prompt).reprompt(reprompt).shouldEndSession(true).send();
    });
    return false;
  }
});

app.intent('AMAZON.HelpIntent', function(req, res) {
  var prompt = 'You can ask me for the status of any Divvy Station. Try asking me about status at Millennium Park';
  res.say(prompt).shouldEndSession(false);
});

app.intent('AMAZON.StopIntent', function(req, res) {
  res.say('Ok');
});

app.intent('AMAZON.CancelIntent', function(req, res) {
  res.say('Ok');
});

module.exports = app;
