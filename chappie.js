'use strict';

if (!process.env.token) {
    console.log('Error: Specify SlackBot `token` in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var redis = require('./redis_storage');
var os = require('os');
var $q = require('q');
let nlp = require("nlp_compromise");
let time = require('./time');

if (process.env.redis_url) {
    var redisStorage = redis({
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

function findUser(bot, message) {
    var deferred = $q.defer();

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            deferred.resolve(user);
        } else {

            let askLocation = function (response, convo) {
                convo.ask('Where do you live? Type like `Alwarpet, Chennai` or `600018`', function (response, convo) {
                    convo.next();
                }, {'key': 'location'});

                convo.on('end', function (convo) {
                    if (convo.status == 'completed') {
                        controller.storage.users.get(message.user, function (err, user) {
                            if (!user) {
                                user = {
                                    id: message.user
                                };
                            }
                            user.name = convo.extractResponse('name');
                            user.location = convo.extractResponse('location');
                            controller.storage.users.save(user, function (err, id) {
                                bot.reply(message, 'Righto right. We are all set ' + user.name + '!');
                                bot.reply(message, 'Type `help` anytime for Chappie to cheer you up!');
                                deferred.resolve(user);
                            });
                        });

                    } else {
                        // this happens if the conversation ended prematurely for some reason
                        bot.reply(message, 'OK, nevermind!');
                    }
                });
            };

            let askName = function (response, convo) {
                convo.say('I do not know your name yet!');
                convo.ask('Type just your name...', function (response, convo) {
                    convo.say('Chappie will call you `' + response.text + '` from now on! :+1:');
                    askLocation(response, convo);
                    convo.next();
                }, {'key': 'name'});
            };

            bot.startConversation(message, askName);
        }
    });

    return deferred.promise;
}

controller.hears(['wfh today'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.log('Key: ' + time.millisecondsToYYYYMMDD(message.ts));
    findUser(bot, message).then(function (user) {
        bot.reply(message, 'okay ' + user.name + '! have fun!');
    });
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
            "Chappie is totally unpredictable with the exception of the following commands: \n `wfh` \n `wfh today`" +
            "\n `wfh tomorrow` \n `office today`  \n `who is coming` \n `who is wfh`");
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
                findUser(bot, message);
            });
        }
    });
});


