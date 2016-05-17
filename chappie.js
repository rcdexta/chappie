'use strict';

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var redis = require('botkit/lib/storage/redis_storage');
var os = require('os');
var $q = require('q');
let nlp = require("nlp_compromise");

var redisStorage = redis({
    namespace: 'groot',
    url: process.env.redis_url
});

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
            deferred.resolve(user.name);
        } else {

            let askLocation = function (response, convo) {
                convo.ask('Where do you live? Type like `Alwarpet, Chennai` or `600018`', function (response, convo) {
                    convo.next();
                }, {'key': 'home'});

                convo.on('end', function (convo) {
                    if (convo.status == 'completed') {
                        controller.storage.users.get(message.user, function (err, user) {
                            if (!user) {
                                user = {
                                    id: message.user
                                };
                            }
                            user.name = convo.extractResponse('name');
                            user.home = convo.extractResponse('home');
                            controller.storage.users.save(user, function (err, id) {
                                bot.reply(message, 'Righto right. We are all set ' + user.name + '!');
                                bot.reply(message, 'Type `help` anytime for Chappie to cheer you up!');
                                deferred.resolve(user.name);
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

            // bot.startConversation(message, function (err, convo) {
            //     if (!err) {
            //         convo.say('I do not know your name yet!');
            //         convo.ask('Type just your name', function (response, convo) {
            //             convo.ask('Chappie will call you `' + response.text + '` from now on?', [
            //                 {
            //                     pattern: bot.utterances.yes,
            //                     callback: function (response, convo) {
            //                         // since no further messages are queued after this,
            //                         // the conversation will end naturally with status == 'completed'
            //                         convo.next();
            //                     }
            //                 },
            //                 {
            //                     pattern: bot.utterances.no,
            //                     callback: function (response, convo) {
            //                         // stop the conversation. this will cause it to end with status == 'stopped'
            //                         convo.stop();
            //                     }
            //                 },
            //                 {
            //                     default: true,
            //                     callback: function (response, convo) {
            //                         convo.repeat();
            //                         convo.next();
            //                     }
            //                 }
            //             ]);
            //
            //             convo.next();
            //
            //         }, {'key': 'nickname'}); // store the results in a field called nickname
            //
            //         convo.ask('Where do you live? Possible responses could be like `Santhome, Chennai`', function (response, convo) {
            //             convo.ask('I will assume home as `' + response.text + '`?', [
            //                 {
            //                     pattern: bot.utterances.yes,
            //                     callback: function (response, convo) {
            //                         // since no further messages are queued after this,
            //                         // the conversation will end naturally with status == 'completed'
            //                         convo.next();
            //                     }
            //                 },
            //                 {
            //                     pattern: bot.utterances.no,
            //                     callback: function (response, convo) {
            //                         // stop the conversation. this will cause it to end with status == 'stopped'
            //                         convo.stop();
            //                     }
            //                 },
            //                 {
            //                     default: true,
            //                     callback: function (response, convo) {
            //                         convo.repeat();
            //                         convo.next();
            //                     }
            //                 }
            //             ]);
            //
            //             convo.next();
            //
            //         }, {'key': 'home'});
            //
            //         convo.on('end', function (convo) {
            //             if (convo.status == 'completed') {
            //                 controller.storage.users.get(message.user, function (err, user) {
            //                     if (!user) {
            //                         user = {
            //                             id: message.user
            //                         };
            //                     }
            //                     user.name = convo.extractResponse('nickname');
            //                     user.home = convo.extractResponse('home');
            //                     controller.storage.users.save(user, function (err, id) {
            //                         bot.reply(message, 'Righto right. We are all set ' + user.name + '!');
            //                         bot.reply(message, 'Type `help` anytime for Chappie to cheer you up!');
            //                         deferred.resolve(user.name);
            //                     });
            //                 });
            //
            //
            //             } else {
            //                 // this happens if the conversation ended prematurely for some reason
            //                 bot.reply(message, 'OK, nevermind!');
            //             }
            //         });
            //     }
            // });
        }
    });

    return deferred.promise;
}

controller.on('direct_message', function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user) {
            return;
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


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face'
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function () {
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

controller.hears(['wfh today'], 'direct_message,direct_mention,mention', function (bot, message) {
    findUser(bot, message).then(function (name) {
        bot.reply(message, 'okay ' + name + '! have fun!');
    });
});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
