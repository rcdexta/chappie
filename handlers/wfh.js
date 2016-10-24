'use strict';
let _ = require('underscore');

module.exports = {

    askAboutTomorrow: function (controller, bot) {
        controller.storage.users.all(function (err, users) {
            console.log(users);
            _.each(users, function(user) {
                console.log('Sending query to user: ' + user.id + ' with name:  ' + user.name)
                bot.startPrivateConversation({user: user.id}, function (err, convo) {
                    if (err) {
                        console.log('Error starting private conversation!')
                        console.log(err);
                    } else {
                        convo.ask({
                            "text": "Are you coming to office tomorrow?",
                            "attachments": [
                                {
                                    "fallback": "Please respond yourself by typing `help`",
                                    "callback_id": "wopr_game",
                                    "color": "#3AA3E3",
                                    "attachment_type": "default",
                                    "actions": [
                                        {
                                            "name": "yes",
                                            "text": "Yes",
                                            "type": "button",
                                            "value": "yes"
                                        },
                                        {
                                            "name": "no",
                                            "text": "No",
                                            "style": "danger",
                                            "type": "button",
                                            "value": "no"
                                        },
                                        {
                                            "name": "maybe",
                                            "text": "Maybe",
                                            "type": "button",
                                            "value": "maybe"
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                });
            })
        });
    }

};