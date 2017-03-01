# Chappie

![https://github.com/rcdexta/chappie/raw/master/assets/bot_icon.png](https://github.com/rcdexta/chappie/raw/master/assets/bot_icon.png)

Chappie is a slackbot for your workplace that helps you with the following:

* if part of your company is remote, Chappie can aggregate stats about who is coming to office or working from home on a particular day
* can give you reports and forecasts about who you can meet at office on a specific day
* can give you traffic updates if you are planning to commute to office on a specific day [wip]
* can be used to send reminder messages to colleagues set to be pinged at a specific time

### Demo

![https://github.com/rcdexta/chappie/raw/master/assets/chappie.gif](https://github.com/rcdexta/chappie/raw/master/assets/chappie.gif)

### Setup

The first step is to create a Slack application. Start [here](https://api.slack.com/apps?new_app=1) and also refer [this guide](https://api.slack.com/slack-apps) for more details.

At the end of the setup, you will be provided with `clientId`  and `clientSecret` tokens, please make note of them.

Now, clone the repository and install the npm dependencies

```shell
$ git@github.com:rcdexta/chappie.git
$ cd chappie
$ npm install
```

Once, you are all set, run the following command:

```shell
clientId=<client_id> clientSecret=<client_secret> port=3000 redis_url=<redis_url> npm start
```

This will start up Chapiie in server mode… There is one more step before we get the bot up and running. The Slack app oauth configuration should point to the local server that you just started. Refer to `OAuth & Permissions` section inside the app settings page and set the redirect URL to `http://localhost:3000/oauth`

Now, navigate to the browser and type `http://localhost:3000/login` and you will be redirected to your team slack page asking for permissions to enable Chappie as a third-party app. Once you are done with that, Chappie will come alive!

### License

MIT
