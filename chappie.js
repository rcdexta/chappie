'use strict';

if (!process.env.clientId || !process.env.clientSecret || !process.env.port) {
  console.log('Error: Specify SlackBot `clientId` and `clientSecret` and `port` in environment');
  process.exit(1);
}

//Libraries
var Botkit = require('botkit')
var os = require('os')
let nlp = require("nlp_compromise")
var CronJob = require('cron').CronJob
var Redis = require('./storage/redis')

//Modules
var WfhHandler = require('./handlers/wfh');
var ResponseHandler = require('./handlers/responder')
var CalendarHandler = require('./handlers/calendar')
var Talker = require('./handlers/talker');
let Time = require('./helpers/time');

if (process.env.redis_url) {
  var redisStorage = Redis({
    namespace: 'chappie',
    url: process.env.redis_url
  });
}

var controller = Botkit.slackbot({
  stats_optout: true,
  debug: false,
  storage: redisStorage
}).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['bot'],
  }
);

controller.setupWebserver(process.env.port, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });

  webserver.post('/message_action', function (req, res) {
    console.log('inside message action')
    console.log(req.body.payload)

    const payload = JSON.parse(req.body.payload)

    const user = payload.user;

    console.log('user')
    console.log(user)

    if (payload.callback_id === 'wfh_interaction') {
      const location = payload.actions[0].name === 'yes' ? 'office' : 'home';
      let key = Time.formatYYYYMMDD(Time.tomorrowForEpochTime(payload.message_ts));
      CalendarHandler.saveToCalendar(controller, null, user, key, location);
    }

    if (payload.actions[0].name === 'yes' ) {
      res.send(Talker.sayOffice(user.name));
    } else {
      res.send(Talker.sayWfh(user.name));
    }
  });
});

var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}


controller.on('create_bot', function (bot, config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function (err) {

      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy}, function (err, convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say("I'm consciousness. I'm alive. I'm Chappie.")
          convo.say('Type `help` to know more about how we can converse...')
        }
      });

      // Ask user every 20 mins
      var job = new CronJob({
        cronTime: "0 0 16 * * 0-4",
        onTick: function () {
          console.log('Calling askAboutTomorrow')
          WfhHandler.askAboutTomorrow(controller, bot)
        },
        start: false,
        timeZone: 'Asia/Kolkata'
      });
      job.start();

    });
  }

});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

ResponseHandler.respondTo(controller)

