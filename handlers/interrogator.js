'use strict';

module.exports = {

    askUserEveryDay: function(bot) {

        bot.startPrivateConversation({user: 'U0CM8R6TV'},function(err,convo) {
            if (err) {
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
    }

};