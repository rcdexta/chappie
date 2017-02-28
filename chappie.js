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

if (process.env.redis_url) {
    var redisStorage = Redis({
        namespace: 'chappie',
        url: process.env.redis_url
    });
}

var controller = Botkit.slackbot({
    stats_optout: true,
    debug: true,
    storage: redisStorage
}).configureSlackApp(
    {
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        scopes: ['bot'],
    }
);

controller.setupWebserver(process.env.port,function(err,webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });

    webserver.post('/message_action',function(req,res) {
        console.log('inside message action')

        const payload = req.body.payload

        // if (payload.actions[0].value === 'yes') {
        //
        // }

        // var text = req.body.text;
        // text = text.trim();

        // controller.storage.teams.all(function(err,teams) {
        //     var count = 0;
        //     for (var t in teams) {
        //         if (teams[t].incoming_webhook) {
        //             count++;
        //             controller.spawn(teams[t]).sendWebhook({
        //                 text: text
        //             },function(err) {
        //                 if(err) {
        //                     console.log(err);
        //                 }
        //             });
        //         }
        //     }

            res.send('Good for you! Jai Hind!');
        // });
    });
});

var _bots = {};
function trackBot(bot) {
    _bots[bot.config.token] = bot;
}


controller.on('create_bot',function(bot,config) {

    if (_bots[bot.config.token]) {
        // already online! do nothing.
    } else {
        bot.startRTM(function(err) {

            if (!err) {
                trackBot(bot);
            }

            bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
                if (err) {
                    console.log(err);
                } else {
                    convo.say("I'm consciousness. I'm alive. I'm Chappie.")
                    convo.say('Type `help` to know more about how we can converse...')
                }
            });

            // Ask user every 20 mins
            var job = new CronJob({
                cronTime: "0 */20 * * * *",
                onTick: function() {
                    console.log('Calling askAboutTomorrow')
                    WfhHandler.askAboutTomorrow(controller, bot)
                },
                start: false,
                timeZone: 'America/Los_Angeles'
            });
            job.start();

        });
    }

});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});

ResponseHandler.respondTo(controller)

