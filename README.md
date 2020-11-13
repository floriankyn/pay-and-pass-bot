# Discord Pay&Pass Bot
A discord bot, built on top of <a href="https://discord.js.org">discord.js</a> & <a href="https://stripe.com">stripe</a>.

# Features:

This bot has few commands. Here are the highlights:
### Commands For everyone:
- `?store` -> Display the channel access store.
- `?id` -> Display your discord id to specify while purchasing.
- `?info` -> Display info relative to the bot.
- `?help` -> Help you to use the bot.

### Commands for moderators:
- `?staff-add <@user/userId>` -> Give the specified user moderation privileges.
- `?staff-remove <@user/userId>>` -> Remove the specified user moderation privileges.
- `?private-channel-set <Price>` -> Set the channel as private for the specified amount of $USD.
- `?private-channel-remove` -> Set back the channel as public.
- `?channel-info:` -> Show some channel information.

### Help
- `?help` -> Lists all commands or just help for one command.

# Installation

This bot runs on [node.js](https://nodejs.org). You will need at least node 12.

### General

Install [node 12 or newer]((https://nodejs.org/en/download/)),

Run `npm install` in the bot directory and make sure it passes.

Now set up your `config.json` and run `npm start` or `node index.js` in `./src` to test the bot out!

## Windows

1. Install [node.js](https://nodejs.org/en/download/)
2. Run `npm install` and make sure it succeeds
3. Set up your `config.json`
4. Run `npm start` or `node index.js` in `./src`  to test the bot out!
5. Run `npm start` or `node server.js` in `./src` to run the server as localhost

### Additional Resources

* [Installing Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Deployd node server on heroku](https://www.youtube.com/watch?v=AZNFox2CvBk)

# Setting up
Before the first run you will need to modify the `config.json` in `./src`. A bot token is required. Stripe tokens are also required. If you want to change the bot prefix, change the row `"prefix": "chosen prefix"`. 


[Please see this excellent guide for how to create your discord bot's account and get your bot token.](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

Verify that the bot runs with your config by running `npm start`.

# Running longterm
Once you've setup your keys and checked that the features you want are working, you have a couple of options for running the bot.

## Selfhosted
You could run the bot along side everything else on your pc. However it's probably a good idea to run your bot on a separate computer such as a linux server or a Raspberry Pi so it does not interfere with your normal operations and to keep it running even if you were to sleep or shutdown your PC. 

## Cloud Hosted
There is a number of cloud hosting providers that can run small node.js applications like this. The following have been tested to work, you'll have to extrapolate if you want to use some other provider (AWS, etc)

### Running on Heroku
- Create heroku account, install heroku-cli, create a new Dyno.
- Git clone the repo and follow the instructions in the Deploy section to setup pushing to heroku
- Go to settings and setup Config Vars the name of the vars are exactly the same as the config.json file. You **DO NOT** need the quotes around the values in config vars
- Run `heroku scale worker=1` in the bot installation directory to run the bot as a worker rather than a webserver.
- SOME COMMANDS ARE NOT WORKING, I AM WORKING TO FIX THIS.

# Help
Please check the GitHub issues page on this project. We get a lot of similar questions, and it is likely that yours has already been answered. 

If you still need help, feel free to join us on [Discord](https://discord.gg/6ukYkNzgXk).
