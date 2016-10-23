'use strict';

module.exports = {

    dailyQueryToUser: function(controller, bot, message) {

        bot.startConversation(message, function(err, convo) {

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
        });
    }

};