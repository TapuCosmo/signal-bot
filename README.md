# Signal-Bot

A library for creating bots that interact with the Signal application. Not affiliated with the Signal project or Open Whisper Systems.

Install with `npm install signal-bot`.

Currently only works on Linux, with Node.js >=14.0.0.

This library requires a working installation of [signal-cli](https://github.com/AsamK/signal-cli)
running in daemon mode with the phone number you want to use.
Use [this Python script](https://gist.github.com/Vic3198/f0c9e17ef3d70e7b8c066bfd8cf4db2d) for an easy installation process.

Tested on v0.7.2 of signal-cli.

[View Documentation](https://tapucosmo.github.io/signal-bot/)

## Example Usage

### Basic Commands

```js
const {Client} = require("signal-bot");

const bot = new Client();

const prefix = "!";

bot.on("message", msg => {
  if (!msg.content.startsWith(prefix)) return;
  const command = msg.content.slice(prefix.length);

  if (command === "hello") {
    msg.conversation.sendMessage("Hello World!");
  } else if (command === "whoami") {
    msg.conversation.sendMessage(`You are ${msg.author.id}`);
  }
});

bot.connect();
```

Send the bot `!hello` and it should respond with `Hello World!`.

Send the bot `!whoami` and it should respond with `You are <phone number>`.

## Missing Features

* signal-cli D-Bus missing features:
  - Group conversation invite event
  - Group conversation leave event
  - Reactions
  - Stickers
* Contact management
* Additional user/group member information/profiles
* Group conversation member list
* Group conversation admin functions
