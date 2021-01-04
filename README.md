[![Discord](https://img.shields.io/badge/Chat-Discord-blue.svg)](https://discord.gg/JQeVxbQT5G)
# AFKBot
A bot for Minecraft to stay AFK thanks to [mineflayer](https://github.com/PrismarineJS/mineflayer). Mainly for Windows, but works also on macOS and Linux.

Written in Node.js

[Link](https://drmoraschi.github.io/AFKBot/) to the page of this project.

<img alt="logo" src="https://github.com/DrMoraschi/AFKBot/raw/master/projectlogo.jpg" height="200" />

## Features

 * Supports up to 1.16.3.
 * An easy-to-use GUI with incorporated chat thanks to [mineflayer-dashboard](https://github.com/wvffle/mineflayer-dashboard).
 * Windows Desktop Notifications for events like /tell or on death. These can be disabled inside config.json. Thanks to [node-notifier](https://github.com/mikaelbr/node-notifier).
 * Discord WebHook Notifications for some events. Can be configured in config.json. Thanks to [discord.js](https://github.com/discordjs/discord.js).
 * Automatic response (whispered) like "Sorry, I am an AFK Bot", to people who "/tell" you.
 * Pathfinding ability to make your AFK bot follow you from one place to another, thanks to [mineflayer-pathfinder](https://github.com/Karang/mineflayer-pathfinder).
 * Auto-Eat feature to auto eat(obviously) thanks to [mineflayer-auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat).
 * Reconnect ability in case it's kicked from the server.
 * Online/Cracked mode support.
 * Looks at nearby entities simulating real players.
 * Alerts on low health.
 * Option to make bot attack mobs inside his range (KillAura) for self-defense, can be disabled in config.json.
 * Shows who attacked the bot and the weapon. Thanks to [mineflayer-bloodhound](https://github.com/Nixes/mineflayer-bloodhound).

## Install

 1. Make sure you have installed **Node** on your PC, once you have installed it, you can proceed to the next step. You can download Node [here](https://nodejs.org/).
 1. Create a folder somewhere in you PC.
 2. Extract the downloaded .zip in the folder, there should be a folder named AFKBot-master, take the files and paste them where you want, like a folder.
 3. Now, open the command prompt (press WIN + R, it should open a window, type in "cmd" and hit ENTER).
 4. Navigate to the folder where you put the files (Example: type "cd C:\Users\DrMoraschi\Desktop\BotFolder" and hit ENTER).
 5. Now where are going to install **Mineflayer** and the other dependencies, type:
	
	`npm install`
    
    this will install all dependencies that are necessary.

 6. Now that all the things have been installed, the bot is ready to run and go AFK.

## Commands

 1. The bot is configured to only reply to "/tell" messages. It will reply with "Sorry, I am an AFK Bot".
 2. The bot will only follow you if tell him to do so:
	
	*/tell [botname] follow me*

	Will make the bot follow you.

	*/tell [botname] stop*

	Will make the bot stop following you.

 3. The bot will start the anti-AFK-kick sequence when connected automatically, it will jump every 10 minutes to prevent kicks.
 4. The bot will attack enemy mobs that are inside his range, he can't attack multiple mobs at once, but the option can be disabled.
 
## How to Use

 1. Before starting the bot, please take a look at config.json, the options are:
 	* "username": A name for the bot, if the server has online-mode set to true, it's the e-mail.
	* "password": Password of the account, if the server has online-mode set to false, you can leave it as null.
	* "host": IP of the server.
	* "port": Port of the server. 25565 by default.
	* "windowsAnnouncements": true/false. Receive notifications from Windows if something happens to the bot.
	* "owner": Minecraft Username of the owner of the bot, so that the bot only replies to him.
	* "attackMobs": true/false. Wether to attack mobs that are in range(KillAura).
	* "autoEat": Options of the auto eat.
        	* "startAt": A number from 1 to 20(both included), example: "startAt": 19 => The bot will start to eat when its health reaches 9,5 food points. Default 19.
		* "priority": Choose from 'saturation' or 'foodPoints'. 'saturation' -> Bot chooses food with highest saturation. 'foodPoints' -> Bot chooses food with highest food points.
	* "webhook": Settings for the Discord Webhook.
		* "sendMessage": true/false. Print chat in a channel with a webhook and receive notifications if something happens to the bot.
		* "webhookUrl": URL of the webhook.
		* "userIDToPing: ID so that the webhook pings you on Discord when something happens. WARNING: It's the ID of the user, not the USERNAME. You need to enable Developer Mode to get an ID of a user.
 2. In your Command Line, repeat number 4 from "Install"; navigate to the folder where the files are located.
 3. To start the bot, just type in:
	
	```node index.js```

 3. Once you've written all, hit ENTER and watch as the GUI starts and the bot connects to the server.

 ### WARNING
 
  I am not responsible of any consequences that this bot may cause, when you are downloading it, it's up to you and to be responsible of your own actions.
  
  Thank you.
