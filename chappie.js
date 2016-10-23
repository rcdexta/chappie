'use strict';

if (!process.env.clientId || !process.env.clientSecret) {
    console.log('Error: Specify SlackBot `clientId` and `clientSecret` in environment');
    process.exit(1);
}

//Libraries
var Botkit = require('botkit');
var os = require('os');
let nlp = require("nlp_compromise");

//Modules
var Redis = require('./storage/redis');
var UserHandler = require('./handlers/user');
var CalendarHandler = require('./handlers/calendar');
var Interrogator = require('./handlers/interrogator');
var CronJob = require('cron').CronJob;

if (process.env.redis_url) {
    var redisStorage = Redis({
        namespace: 'chappie',
        url: process.env.redis_url
    });
}

var controller = Botkit.slackbot({
    stats_optout: true,
    debug: false,
    // interactive_replies: true,
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

        console.log(req.body.payload)

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
                    convo.say('Type `help` to know more about how we can converse with each other...')
                }
            });

            // Ask user every 20 mins
            var job = new CronJob({
                cronTime: "0 */20 * * * *",
                onTick: function() {
                    console.log('Calling askUserEveryDay')
                    Interrogator.askUserEveryDay(bot)
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


controller.hears(['.*office\\s+tomorrow.*', '.*coming\\s+to\\s+office\\s+tomorrow.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <wfh tomorrow>');
    CalendarHandler.officeTomorrow(controller, bot, message);
});

controller.hears(['.*office\\s+today.*', '.*coming\\s+to\\s+office.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <office today>');
    CalendarHandler.office(controller, bot, message);
});

controller.hears(['.*wfh\\s+tomorrow.*', '.*working\s+from\s+home\s+tomorrow.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <wfh tomorrow>');
    CalendarHandler.wfhTomorrow(controller, bot, message);
});

controller.hears(['.*wfh\\s+today.*', '.*working\\s+from\\s+home.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <wfh today>');
    CalendarHandler.wfh(controller, bot, message);
});

controller.hears(['who\\s+is\\s+wfh','.*who.*wfh.*','.*who.*working\\s+from\\s+home.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <who is wfh>');
    CalendarHandler.stats(controller, bot, message);
});

controller.hears(['who\\s+is\\s+coming','.*who.*coming.*','.*who.*coming\\s+to\\s+office.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    console.log('Responding to <who is wfh>');
    CalendarHandler.stats(controller, bot, message);
});

controller.hears(['identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {
        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. And what a lovely day!');

    });


controller.hears(['ask me'],
    'direct_message,direct_mention,mention', function (bot, message) {
        Interrogator.dailyQueryToUser(controller, bot,message);
    });

controller.hears(['help', '\\?'],
    'direct_message,direct_mention,mention', function (bot, message) {
        bot.reply(message,
            "Chappie can understand the following questions! Ask anything else at your own risk :smiling_imp: \n `wfh` \n `wfh today`" +
            "\n `wfh tomorrow` \n `office today`  \n `office tomorrow`  \n`who is coming` \n `who is wfh`");
    });

//Wild Card pattern to capture all other messages
controller.hears(['.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user) {
            bot.reply(message, 'I cannot comprehend that! Type `help` to help me converse with you');
        } else {
            //First message from user
            bot.reply(message, "I'm consciousness. I'm alive. I'm Chappie.");
            user = {
                id: message.user
            };
            controller.storage.users.save(user, function () {
                UserHandler.lookup(controller, bot, message);
            });
        }
    });
});


