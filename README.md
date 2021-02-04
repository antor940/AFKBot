[![Discord](https://img.shields.io/badge/Chat-Discord-blue.svg)](https://discord.gg/JQeVxbQT5G)
<h1 align="center"><img src="https://github.com/DrMoraschi/AFKBot/raw/master/files/logo.png" width="65" height="40">AFKBot<img src="https://github.com/DrMoraschi/AFKBot/raw/master/files/logo.png" width="65" height="40"></h1>

A Bot for Minecraft to stay AFK thanks to [mineflayer](https://github.com/PrismarineJS/mineflayer). Mainly for Windows, but should work on macOS and Linux.

Written in Node.js

[Link](https://drmoraschi.github.io/AFKBot/) to the page of this project.

<img alt="logo" src="https://github.com/DrMoraschi/AFKBot/raw/master/files/logo.png" height="200" />

## Features

 * Supports up to 1.16.5.
 * Windows Desktop Notifications for events like death. These can be disabled inside config.json. Thanks to [node-notifier](https://github.com/mikaelbr/node-notifier).
 * Use a Discord Bot to control the AFKBot. Can be configured in config.json. Thanks to [discord.js](https://github.com/discordjs/discord.js).
 * Pathfinding ability to make your AFKBot follow you from one place to another, thanks to [mineflayer-pathfinder](https://github.com/Karang/mineflayer-pathfinder).
 * Auto-Eat feature to auto eat (obviously) thanks to [mineflayer-auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat).
 * Reconnect ability in case it's kicked from the server.
 * Online/Cracked mode support.
 * Custom whispered replies to whispers from other players.
 * Looks at nearby entities, can be disabled in config.json.
 * Option to make Bot attack mobs inside his range (KillAura) for self-defense, can be disabled in config.json. Thanks to [mineflayer-pvp](https://github.com/PrismarineJS/mineflayer-pvp)
 * Shows who attacked the Bot and with what weapon. Thanks to [mineflayer-bloodhound](https://github.com/Nixes/mineflayer-bloodhound).
 * View AFKBot's view in a webpage. Can be disabled in config.json. Thanks to [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer)

## Install

 1. Make sure you have installed **Node** on your PC, once you have installed it, you can proceed to the next step. You can download Node [here](https://nodejs.org/).
 1. Create a folder somewhere in you PC.
 2. Extract the downloaded .zip in the folder, there should be a folder named AFKBot-master, take the files and paste them where you want, like a folder.
 3. Now, open the command prompt (press WIN + R, it should open a window, type in "cmd" and hit ENTER).
 4. Navigate to the folder where you put the files (Example: type "cd C:\Users\DrMoraschi\Desktop\BotFolder" and hit ENTER).
 5. Now where are going to install **Mineflayer** and the other dependencies, type:
	
	`npm install`
    
    this will install all dependencies that are necessary.

 6. Now that all the things have been installed, the Bot is ready to run and go AFK.

## Commands

 Commands will be sent to the channel on startup. You can choose.
 
## How to Use

This Bot requires a Discord Bot to be set up beforehand, if you don't know how to do it. [Discord Bot Tutorial](https://www.writebots.com/discord-bot-token/)
 1. Before starting the Bot, please take a look at config.json, the options are:
 	* "logs": Logging options.
		* "log-chat-to-console": Prints the chat to the console.
		* "log-chat-to-file": Save the chat in a file, chat.log. Erased on restart.
 	* "server": Server options.
		* "host": IP of the server.
		* "port": Port of the server. Default is 25565.
	* "afkbot": Options for the Bot.
		* "username": A name for the Bot, if the server has online-mode set to true, it's the e-mail.
		* "password": Password of the account, if the server has online-mode set to false, you can leave it blank.
		* "auth-method": Method of authenticating. Default is "mojang", can be also "microsoft".
	* "discord": Discord Bot options.
		* "token": Token of the Discord Bot.
		* "guild-id": ID of the server. WARNING: It's the ID of the DISCORD SERVER, to get this, you must have Developer Mode turned On.
		* "channel-id": ID of the channel where the Bot will print the chat, or where it will listen for commands.
		* "embed-hex-color": Hex color of the embeds that the Bot will send.
		* "prefix": Prefix for the Bot Commands.
		* "bot-rpc": Bot's Rich Presence options.
			* "enable": Having this set to true, will enable the Rich Presence of the Bot.
			* "text": Text to show in the Rich Presence.
		* "send-chat-to-minecraft": Having this set to true, the Bot will read all non-commands messages and send it to Minecraft.
	* "whispers": How the Bot will handle whispers.
		* "enable-answer": Having this set to false, will make the Bot ignore all whispers that are for him.
		* "timeout-on-whisper": Time in milliseconds that will pass between receiving the whisper and sending a reply.
		* "message-to-answer": Message to answer when someone whispers to the Bot.
	* "pvp": PvP-PvE options.
		* "enable": Having this set to false, will make the Bot ignore all approaching mobs.
		* "attack-players": Having this set to false, will make the Bot ignore approaching players.
		* "attack-endermans": Having this set to false, will make the Bot ignore approaching endermens.
	* "auto-eat": Auto-Eat options. This plugin automatically toggles depending on if the Bot has food in his inventory or not.
		* "enable": Having this set to false, will make the Bot not eat when he is hungry.
		* "send-status": Having this set to true, will make the Bot send status updates of this plugin in the form of Discord Embeds.
		* "priority": "saturation" or "foodPoints".
		* "start-at": 1-20. Food level to start eating at.
		* "banned-foods": [Array of banned foods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
	* "bloodhound": Bloodhound options.
		* "enable": Having this set to false, the Bot won't find out who attacked it before killing it.
	* "viewer": Viewer options.
		* "enable": Having this set to false, the Bot won't create a Viewer.
		* "port": Number of a port. Can be left as default: 3000.
	* "low-health": Low-Health options.
		* "warn-on-low-health": Having this set to true, will make the Bot send a message if his health goes below "health-points".
		* "health-points": Critical health level.
		* "disconnect-on-low-health": Having this set to true, will make the Bot disconnect when his health goes below "health-points".
	* "imitate-crouching": Imitate crouching options.
		* "enable": Having this set to true, will make the Bot try to imitate if a player crouches near him. Trying to show a sign of Peace.
	* "message-on-interval": Interval message options.
		* "enable": Having this set to true, will make the Bot say a message every "interval" milliseconds.
		* "inteval": Milliseconds between each message is sent.
		* "message": Message to say.
	* "windows-notifications": Windows Notification options.
		* "on-banned": Having this set to true, will make the Bot send a Windows Notification when it's banned.
		* "on-kicked": Having this set to true, will make the Bot send a Windows Notification when it's kicked.
		* "on-death": Having this set to true, will make the Bot send a Windows Notification when it dies or it's killed.
	* "misc-options". Miscellaneous options.
		* "send-chat-to-ds": Having this set to true, will make the Bot send the minecraft chat to Discord, not recommended as Discord doesn't like having a lot of messages sent in a short span of time.
		* "antikick-jump": Having this set to true, will make the Bot jump every "antikick-jump-interval" milliseconds.
		* "look-entities": Having this set to true, will make the Bot look at nearby players.
		* "pathfind-range": Number of blocks the Bot should stay away from the target when it's following him.
	* "timeouts": Timeouts on various events. All of them have to be in milliseconds.
		* "on-kicked": Milliseconds that will pass before the Bot will reconnect to the server if it's kicked.
		* "conenct-timeout": Milliseconds that have to pass before the Bot will stop trying to connect to the server if it's unreachable.
		* "antikick-jump-interval": Milliseconds that will pass between each "antikick-jump" jump.
	* "debug": Having this set to true will make the Bot print some useless extra information in the console.
 2. In your Command Line, repeat number 4 from "Install"; navigate to the folder where the files are located.
 3. To start the bot, just type in:
	
	```node index.js```

 3. Once you've written all, hit ENTER and watch as the GUI starts and the bot connects to the server.

 ### WARNING
 
  I am not responsible of any problems that this Bot may cause, when you are downloading it, it's up to you and to be responsible of your own actions.
  
  Thank you.
