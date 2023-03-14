# quiet-winds-trivia-bot
Trivia bot for Discord, with incentives for playing/top scores. Built with Node.js &amp; MySQL for the database.

Welcome to Quiet Wind's Trivia, a Discord bot!
NOTE: ***THIS BOT/PROJECT IS CURRENTLY IN DEVELOPMENT AND NOT YET RELEASED. It is however, open source, so feel free to take and use the code and its dependencies/packages for your own use and/or contribute to the project. Below are a list of dependencies and features:***

DEPENDENCIES:
- discord.js (Node.js)
- mysql (Node.js)
- dotenv (Node.js)
- SQL server (compatible with mysql npm package)

CURRENT FEATURES:
- Ability to start a trivia game, and set it up
- Responds to "?hello" command with "How are you?"

## 03/14/2023:

Working on:
- Finishing the main functionality of the trivia game itself. Currently needs a complete rework of Message() and Trivia() classes.
- Administrator commands. Administrator commands will be able to be unlocked after setting a password/userID for the admin and/or staff of the server the bot is in. These commands will allow the staff of the server to configure the bot with numerous different settings.
- Developer commands. Once implemented, these commands will mostly be for troubleshooting/diagnostics, and also bot training. Since this is a trivia bot, and trained on a few different trivia APIs, the developer will be able to run commands to re-train the bot on more/new trivia, from different sources, and with the ability to configure before hand of what categories(y) he or she would like the bot to train on, and also be able to configure a time limit set for how long the bot will train on new trivia questions.

Known bugs:
- When running a new bot command while a trivia game is currently running, in (any) channel, the bot gets confused and throws an error in the console, and responds to the user as if their "answer" was incorrect. I have identified the issue, and will be working the next few days (as of 03/13/2023) to re-work both of the primary classes controlling the game, in order to fix this issue and make the code more readable. Everything will probably be condensed into one main class OR properly divided between multiple smaller ones, which will take extra time to get right while also being readable and feature packed.

EXTRAS:
- This bot was an idea I had while being in a larger ant-keeping Discord server. As an ant-keeper myself, which a lot of people aren't, or may not even know what that entails--I noticed the amount of trivia games for ant-keeping is... pretty minimal. So, one of the categories in the trivia game will be about ant-keeping, AND/OR different TYPES of categories pertaining to ant-keeping rather than just category.
- This bot is, again, not currently finished, and needs lots of work before a proper beta test is released. Once a worthy version is released for beta, I will push a commit with the beta version. As of writing this, the code in the main branch is not identical to what I currently have, and some of the bugs in the code are already fixed, again, along with a re-work. But I digress. If you have any questions, contact me at calebhesse42@gmail.com and I will get back to you when I can. I also have numerous other projects going on as well, so please be patient for updates.
