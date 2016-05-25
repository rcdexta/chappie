'use strict';

if (!process.env.token) {
    console.log('Error: Specify SlackBot `token` in environment');
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

if (process.env.redis_url) {
    var redisStorage = Redis({
        namespace: 'chappie',
        url: process.env.redis_url
    });
}

var controller = Botkit.slackbot({
    debug: false,
    storage: redisStorage
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

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

controller.hears(['help', '\\?'],
    'direct_message,direct_mention,mention', function (bot, message) {
        bot.reply(message,
            "Chappie's vocabulary below... Type anything else at your own risk :smiling_imp: \n `wfh` \n `wfh today`" +
            "\n `wfh tomorrow` \n `office today`  \n `office tomorrow`  \n`who is coming` \n `who is wfh`");
    });

//Wild Card pattern to capture all other messages
controller.hears(['.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user) {
            bot.reply(message, 'I cannot comprehend that! How about a ');
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


