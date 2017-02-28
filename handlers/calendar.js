'use strict';

var UserHandler = require('./user');
var Talker = require('./talker');
let Time = require('../helpers/time');
let _ = require('underscore');
var $q = require('q');

module.exports = {

    saveReply: function (controller, bot, message, key, location) {

        var deferred = $q.defer();

        UserHandler.lookup(controller, bot, message).then(function (user) {
            controller.storage.calendar.get(key, function (err, calendar) {
                if (calendar) {
                    var users = calendar.users;
                    var existingUser = _.find(users, function (savedUser) {
                        return savedUser.name == user.name;
                    });
                    if (existingUser) {
                        existingUser.location = location;
                    } else {
                        users.push({name: user.name, location: location});
                    }
                    calendar.users = users;
                } else {
                    calendar = {
                        id: key,
                        users: [{name: user.name, location: location}]
                    }
                }
                controller.storage.calendar.save(calendar, function (err, id) {
                    deferred.resolve(user);
                });
            });
        });

        return deferred.promise;
    },

    wfh: function (controller, bot, message) {
        let key = this.key(message.ts);
        this.saveReply(controller, bot, message, key, 'home')
            .then(function (user) {
                console.log('replying to user');
                bot.reply(message, Talker.sayWfh(user.name));
            });
    },

    office: function (controller, bot, message) {
        let key = this.key(message.ts);
        this.saveReply(controller, bot, message, key, 'office')
            .then(function (user) {
                bot.reply(message, Talker.sayOffice(user.name));
            });
    },

    officeTomorrow: function (controller, bot, message) {
        let tomorrow = Time.tomorrowForEpochTime(message.ts);
        let key = Time.formatYYYYMMDD(tomorrow);
        this.saveReply(controller, bot, message, key, 'office')
            .then(function (user) {
                bot.reply(message, Talker.sayOffice(user.name));
            });
    },

    wfhTomorrow: function (controller, bot, message) {
        let tomorrow = Time.tomorrowForEpochTime(message.ts);
        let key = Time.formatYYYYMMDD(tomorrow);
        this.saveReply(controller, bot, message, key, 'home')
            .then(function (user) {
                bot.reply(message, Talker.sayWfh(user.name));
            });
    },

    stats: function (controller, bot, message) {
        let key = this.key(message.ts);
        UserHandler.lookup(controller, bot, message).then(function () {
            controller.storage.calendar.get(key, function (err, calendar) {
                if (calendar) {
                    var fromHome = _.pluck(_.filter(calendar.users, {location: 'home'}), 'name');
                    var toOffice = _.pluck(_.filter(calendar.users, {location: 'office'}), 'name');
                    controller.storage.users.all(function(err, users){
                        console.log(users);
                        var allNames = _.pluck(users, 'name');
                        console.log(allNames);
                        var undecided = _.difference(allNames, _.union(fromHome, toOffice));
                        console.log(undecided);
                        bot.reply(message, "Yo-ho-ho! \n Dudes working from home: " + fromHome +
                            "\nThe brave hearted commuters to office: " + toOffice + "" +
                            "\nAnd I dunno what these fellas are upto: " + undecided);
                    });
                } else {
                    bot.reply(message, 'Alas! No one talked to Chappie! You got yourself a deserted office today matey!')
                }
            });
        });
    },

    key: function (ts) {
        return Time.millisecondsToYYYYMMDD(ts);
    }
};