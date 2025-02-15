A Bot for Minecraft to stay AFK thanks to [mineflayer](https://github.com/PrismarineJS/mineflayer). Mainly for Windows, but should work on macOS and Linux.

Written in Node.js

[Link](https://drmoraschi.github.io/AFKBot/) to the page of this project.

<img alt="logo" src="https://github.com/DrMoraschi/AFKBot/raw/master/files/logo.png" height="200" />

<h2 align="center">Features</h2>

 * Supports up to 1.16.5, recommended to use the latest MC versions.
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
 * View AFKBot's view in a webpage, and control him with the middle button of the mouse. Can be disabled in config.json. Thanks to [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer).

<h2 align="center">Downloads</h2>

I highly advise to download the latest version:
	[Latest release](https://github.com/DrMoraschi/AFKBot/releases/latest)

But you can always check out the older versions:
	[Older releases](https://github.com/DrMoraschi/AFKBot/releases)

<h2 align="center">Install</h2>

 1. Make sure you have installed **Node** on your PC, once you have installed it, you can proceed to the next step. You can download Node [here](https://nodejs.org/).
 1. Create a folder somewhere in you PC.
 2. Extract the downloaded .zip in the folder, there should be a folder named AFKBot-master, take the files and paste them where you want, like a folder.
 3. Now, open the command prompt (press WIN + R, it should open a window, type in "cmd" and hit ENTER).
 4. [Navigate](https://www.techwalla.com/articles/how-to-use-quotcdquot-command-in-command-prompt-window) to the folder where you put the files (Example: type "cd C:\Users\DrMoraschi\Desktop\BotFolder" and hit ENTER).
 5. Now where are going to install **mineflayer** and the other dependencies, type:
	
	`npm install`
    
    this will install all dependencies that are necessary.

 6. Now that all the things have been installed, the Bot is ready to run and go AFK.

<h2 align="center">Commands</h2>

 Commands will be sent to the channel on startup. You can choose.
 Alternatively, you can look at the list [here](https://drmoraschi.github.io/AFKBot/files/page/)
 
<h2 align="center">How to Use</h2>

This Bot requires a Discord Bot to be set up beforehand, if you don't know how to do it. [Discord Bot Tutorial](https://www.writebots.com/discord-bot-token/)
 1. Before starting the Bot, please take a look at all the options of the [config.json](https://github.com/DrMoraschi/AFKBot/blob/master/files/config.md).
 2. In your Command Line, repeat number 4 from **Install**; navigate to the folder where the files are located.
 3. To start the bot, just type in:
	
	```npm start```

 3. Once you've written all, hit ENTER and watch as the Bot starts.

<h2 align="center">WARNING</h2>
 
  I am not responsible of any problems that this Bot may cause, when you are downloading it, it's up to you and to be responsible of your own actions. Also, there are some forks of this repository that may not offer the features that they say.
  
  Thank you.
  
  This project may be considered as a continuation of [JPenuchot's AFKBot](https://github.com/JPenuchot/AFKBot), but I didn't know of the existence of that Repo when I named mine.
  
  Consider giving a ⭐ in Github if you like this project :) thank you

<a href="https://discord.gg/fFNVp7n8W4"><img alt="Discord Online Users" src="https://img.shields.io/discord/746844033120469062?logo=discord&color=blueviolet&label=Discord" align="left"></a>

<a href="https://github.com/DrMoraschi/AFKBot/releases"><img alt="GitHub all releases" src="https://img.shields.io/github/downloads/DrMoraschi/AFKBot/total?logo=github&color=brightgreen&label=Downloads" align="right"></a>