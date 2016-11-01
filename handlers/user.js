'use strict';

var $q = require('q');

module.exports = {

    lookup: function (controller, bot, message) {
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
                                user.india_employee = convo.extractResponse('india_employee');
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

                let askCountry = function (response, convo) {
                    convo.say('Welcome to Pro.com! Are you working from India?');
                    convo.ask('Type `yes` or `no`', function (response, convo) {
                        convo.say('Good for you buddy!');
                        askLocation(response, convo);
                        convo.next();
                    }, {'key': 'india_employee'});
                };

                let askName = function (response, convo) {
                    convo.say('I do not know your name yet!');
                    convo.ask('Type just your name...', function (response, convo) {
                        convo.say('Chappie will call you `' + response.text + '` from now on! :+1:');
                        askCountry(response, convo);
                        convo.next();
                    }, {'key': 'name'});
                };

                bot.startConversation(message, askName);
            }
        });

        return deferred.promise;
    }
};