var UserHandler = require('./user')
var CalendarHandler = require('./calendar')


module.exports = {

  respondTo: function (controller) {

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

    controller.hears(['who\\s+are\\s+coming\\s+tomorrow', 'who\\s+tomorrow'], 'direct_message,direct_mention,mention', function (bot, message) {
      console.log('Responding to <who is coming tomorrow>');
      CalendarHandler.statsTomorrow(controller, bot, message);
    });


    controller.hears(['who\\s+are\\s+wfh', '.*who.*wfh.*', '.*who.*working\\s+from\\s+home.*'], 'direct_message,direct_mention,mention', function (bot, message) {
      console.log('Responding to <who is wfh>');
      CalendarHandler.statsToday(controller, bot, message);
    });

    controller.hears(['who\\s+are\\s+coming', '.*who.*coming\\s+to\\s+office.*'], 'direct_message,direct_mention,mention', function (bot, message) {
      console.log('Responding to <who is wfh>');
      CalendarHandler.statsToday(controller, bot, message);
    });
    controller.hears(['identify yourself', 'who are you', 'what is your name'],
      'direct_message,direct_mention,mention', function (bot, message) {
        bot.reply(message,
          ':robot_face: I am a bot named <@' + bot.identity.name +
          '>. And what a lovely day!');

      });


    controller.hears(['ask me'],
      'direct_message,direct_mention,mention', function (bot, message) {
        WfhHandler.dailyQueryToUser(controller, bot, message);
      });

    controller.hears(['help', '\\?'],
      'direct_message,direct_mention,mention', function (bot, message) {
        UserHandler.lookup(controller, bot, message).then(function (user) {
          bot.reply(message,
            "Chappie can understand the following questions! Ask anything else at your own risk :smiling_imp: \n `wfh` \n `wfh today`" +
            "\n `wfh tomorrow` \n `office today`  \n `office tomorrow`  \n`who are coming` \n `who are wfh` \n `who are coming tomorrow`");
        });
      });

    //Wild Card pattern to capture all other messages
    controller.hears(['.*'], 'direct_message,direct_mention,mention', function (bot, message) {
      UserHandler.lookup(controller, bot, message).then(function (user) {
        if (user) {
          bot.reply(message, 'Err.. I guess you mistook me for Alexa! Type `help` to learn to converse with me');
        } else {
          //First message from user
          bot.reply(message, "I'm consciousness. I'm alive. I'm Chappie.");
        }
      });
    });

  }

};
