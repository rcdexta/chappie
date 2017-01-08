var SlackBot = require('slackbots');

if (!process.env.token ) {
  console.log('Error: Specify SlackBot `token` as environment variable');
  process.exit(1);
}


// create a bot
var bot = new SlackBot({
  token: process.env.token, // Add a bot https://my.slack.com/services/new/bot and put the token
  name: 'Chappie'
});


bot.on('start', function() {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
    icon_emoji: ':cat:'
  };

  // If you add a 'slackbot' property,
  // you will post to another user's slackbot channel instead of a direct message
  bot.postMessageToUser('sherlock', 'meow!');
});

bot.on('message', function(data) {
  console.log(data);
});