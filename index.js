//Clear output
console.clear();

const mineflayer = require('mineflayer');
const notifier = require('node-notifier');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalFollow } = require('mineflayer-pathfinder').goals
const autoeat = require('mineflayer-auto-eat');
const { server, botOptions, announcements, misc, timeouts } = require('./config.json');
const Discord = require('discord.js');
const chalk = require('chalk');
const RPC = require('discord-rpc');

if (!!announcements.richPresence.enable) {
    const rpc = new RPC.Client({
        transport: 'ipc'
    });
    
    rpc.login({
        clientId: '798273024368443423'
    });
    
    rpc.on('ready', () => {
        console.log(chalk.blueBright(` <DISCORD> Changed RichPresence`))

        rpc.setActivity({
            details: announcements.richPresence.details,
            state: announcements.richPresence.state,
            largeImageKey: 'image',
            largeImageText: announcements.richPresence.imageText,
        });
    });
};

//Run main function
startBot();

function startBot()
{
    //Check config for sendMessage var and initialize Discord bot
    if (announcements.discordBot.sendMessage) {
        //Ensure that user included essential information for bot
        if (!announcements.discordBot.token || !announcements.discordBot.channelID) {
            //Return error if missing info
            console.log(chalk.blueBright('\n   <DISCORD> Please specify a Discord Token and a Discord Channel ID'));
            process.exit(1);
        } else {
            //Create client and login
            global.client = new Discord.Client();
            client.login(announcements.discordBot.token);

            client.on('ready', () => {
                //Start MC Client
                createThis();
            });
        };
    } else {
        //Start MC Client
        createThis();
    };

    //Start MC Client function 
    function createThis()
    {
        //Create Bot with data from config file
        const bot = mineflayer.createBot({
            host: server.host,
            username: botOptions.username ? botOptions.username : 'AFKBot',
            password: botOptions.password,
            hideErrors: true
        });

        //Initiallize Plugins
        bloodhoundPlugin(bot);
        bot.bloodhound.yaw_correlation_enabled = true
    
        bot.loadPlugin(pathfinder);
    
        bot.loadPlugin(autoeat);
        
        //Executes when bot spawns
        bot.once('spawn', () => {
            try {
                if (!!announcements.discordBot.sendMessage) {
                    global.channel = client.channels.cache.get(announcements.discordBot.channelID)
                };
            } catch(err) {
                console.log(`Something went wrong with your channel id.
                Some things to make sure:
                Make sure your bot is added to your server
                Make sure your bot has permission to access the channel.
                
                Here's the error: 
                `+err);
                process.exit(1);
            };
            //Error message ^
            
            //Init mcData, pathfinder
            const mcData = require('minecraft-data')(bot.version);
            const defaultMove = new Movements(bot, mcData);
            defaultMove.allowFreeMotion = true
            bot.pathfinder.setMovements(defaultMove);
    
            //Call function to look at nearest entity
            lookNearEntity();
            
            //Check if config has !!misc.attackMobs enabled, and call !!misc.attackMobss function if true
            if (!!misc.attackMobs === true) attackMobs();
    
            //Configure autoeat
            bot.autoEat.options = {
                priority: `${misc.autoEat.priority}`,
                startAt: misc.autoEat.startAt,
                bannedFood: [],
            };
            
            //Get current players on server
            var playersList = Object.keys(bot.players).join(", ");
    
            if (!!announcements.discordBot.sendMessage) console.log(chalk.blueBright(` <DISCORD> Token found`));

            console.log(chalk.blueBright(` <WORLD> Online players: `)+playersList);
            console.log(chalk.blueBright(` <WORLD> Current time: `)+Math.abs(bot.time.timeOfDay));
            console.log(chalk.greenBright(` <STATUS> Spawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
            

            //Transmits discord chat to ingame
            if (!!announcements.discordBot.sendMessage) {
                client.on('message', (message) => {
                    if (message.author.id === client.user.id || message.channel.id !== announcements.discordBot.channelID) return
                    if (message.content.startsWith(`${announcements.discordBot.prefix}`)) {
                        if (!announcements.discordBot.prefix) {
                            const commandSplit = message.content.replace(`${announcements.discordBot.prefix}`, '');
    
                            bot.chat(commandSplit);
                        } else {
                            const commandSplit = message.content.replace(`${announcements.discordBot.prefix} `, '');
    
                            bot.chat(commandSplit)
                        };
                    };
                });
            };
    
            //Runs when health or Hp change and sends a message in Discord
            bot.once('health', () => {
                const startEmbed = embedConstructor(``, `Time`, `${Math.abs(bot.time.timeOfDay)}`, `Spawn position`, `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`, `Health`, `${Math.floor(bot.health)}`);

                if (!!announcements.discordBot.sendMessage) channel.send(startEmbed)

                if (bot.health <= 5) {
                    console.log(chalk.yellowBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                } else {
                    console.log(chalk.greenBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                };
            });

            //Checks if health is not 20 and (dis/en)ables auto eat when heath changes
            bot.on('health', () => {
                if (bot.food === 20) {
                    bot.autoEat.disable();
                } else {
                    bot.autoEat.enable();
                };
            });
            
            //Sends a message in Discord when a message ingame is recieved
            bot.on('message', (msg) => {
                if (!!announcements.discordBot.sendMessage) channel.send(`<CHAT> `+msg.toString());
    
                console.log(`${msg.toAnsi()}`)
            });

            //Runs when reciving a whisper
            bot.on('whisper', (username, message) => {
                if (username === bot.username) return
                
                try {
                    const playerToFollow = bot.players[username].entity
                    if (username === misc.owner) {
                        switch (message) {
                            case `follow me`:
                                followOwner(playerToFollow, username);
                                break
                            case `stop`:
                                bot.pathfinder.setGoal(null);
                                break
                        };
                    } else if (username !== misc.owner) {
                        bot.whisper(username, 'Sorry, I am an AFK Bot');
                        console.log(chalk.greenBright(' <STATUS> Whispered that I am a bot'));
        
                        if (!!announcements.windowsAnnouncements) notifierSend('Whisper Message', 'You have a new message');
                    };
                } catch(err) {
                    console.log(`An error occurred when attempting to pathfind:
                    Something to check:
                    Make sure you are close to the bot
                    Make sure the bot is not already pathfinding to something

                    The process was not terminated because the error is not critical, so you can attempt to resolve the error and 
                    try again without restart

                    Heres the error:    
                    `+err);
                };
            //Error handling
            });
    
            //Runs when bot is kicked
            bot.on('kicked', (reason) => {

                //Parse response from server
                const reasonKicked = JSON.parse(reason);

                //Return if response empty
                if (!reasonKicked.extra) return

                
                if (reasonKicked.extra[0].text.includes('banned')) {
                    //Check if bot was banned
                    console.log(chalk.redBright(' <STATUS> I got banned. Exiting in 5 seconds...'));
            
                    if (!!announcements.discordBot.sendMessage) {
                        //If discord message is to be sent, send it with ping or no ping based on config
                        const bannedEmbed = embedConstructor(`**I got banned. Exiting in 5 seconds**`, `Reason`, `${reasonKicked.extra[0].text}`);

                        if (!!announcements.discordBot.userIDToPing) {
                            if (!!announcements.discordBot.sendMessage) channel.send(bannedEmbed);

                            if (!!announcements.discordBot.sendMessage) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`);
                        } else {
                            if (!!announcements.discordBot.sendMessage) channel.send(bannedEmbed);
                        };
                    };

                    //Exit process if banned 
                    setTimeout(() => {
                        process.exit(1);
                    }, 5000);
                } else {
                    //If message does not include banned, then tell user and attempt to connect again set timeout
                    console.log(chalk.redBright(` <STATUS> I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds. Reason: `)+reasonKicked.extra[0].text);
                    if (!!announcements.windowsAnnouncements) notifierSend('Event Message', 'I got kicked!');
                
                    if (!!announcements.discordBot.sendMessage) {
                        const kickedEmbed = embedConstructor(`**I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds**`, `Reason`, `${reasonKicked.extra[0].text}`);
    
                        if (!!announcements.discordBot.userIDToPing) {
                            if (!!announcements.discordBot.sendMessage) channel.send(kickedEmbed);
    
                            if (!!announcements.discordBot.sendMessage) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`);
                        } else {
                            if (!!announcements.discordBot.sendMessage) channel.send(kickedEmbed);
                        };
                    };

                    //Reset bot and retry joining
                    setTimeout(() => {
                        if (!!announcements.discordBot.sendMessage) client.destroy();
                        startBot();
                    }, timeouts.onKicked);
                };
            });
            
            //Tell user when bot dies
            bot.on('death', () => {
                console.log(chalk.redBright(` <STATUS> I died!`));
                if (!!announcements.windowsAnnouncements) notifierSend('Event Message', 'I died!');
            });
    
            //Tell user where and when bot respawns
            bot.on('respawn', () => {
                if (!!announcements.discordBot.sendMessage) {
                    const respawnEmbed = embedConstructor(`**I died**`, `Respawn position`, `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`, `Last known attacker`, `${(attackUser.displayName || attackUser.username)}`)
                    
                    if (!!announcements.discordBot.userIDToPing) {
                        if (!!announcements.discordBot.sendMessage) channel.send(respawnEmbed);

                        if (!!announcements.discordBot.sendMessage) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`)
                    } else {
                        if (!!announcements.discordBot.sendMessage) channel.send(respawnEmbed);
                    };
                };

                console.log(chalk.greenBright(` <STATUS> Respawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
            });
            
            //When attacked inform user of attacker, who was attacked and with what
            bot.on('onCorrelateAttack', (attacker, victim, weapon) => {
                if (bot.username === victim.username) {
                    if (weapon) {
                        console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)} with a/an ${chalk.whiteBright(weapon.displayName)}`));
                    } else {
                        console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)}`));
                    };
                };

                global.attackUser = attacker
            });

            //Set the anti afk timeout
            setInterval(() => {
                setTimeout(() => {
                    bot.setControlState('jump', false);
                }, 100);
                    bot.setControlState('jump', true);
            }, timeouts.antiAFK);
            
            //Function to follow a person
            function followOwner(playerToFollow, username)
            {
                bot.whisper(username, 'On my way');
                bot.pathfinder.setGoal(new GoalFollow(playerToFollow, 2), true);
            };
            
            //Function to look near an entity
            function lookNearEntity()
            {
              setInterval(() => {
                const entity = bot.nearestEntity();
                    if (entity !== null) {
                        if (entity.type === 'player') {
                            bot.lookAt(entity.position.offset(0, 1.6, 0));
                        } else if (entity.type === 'mob') {
                            bot.lookAt(entity.position);
                        };
                    };
                }, 50);
            };
            

            //Function to attack mobs
            function attackMobs()
            {
                //Look at a mob, and attack it when an entity moves
                bot.on('entityMoved', (entity) => {
                    if (entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < 8 && entity.mobType !== 'Armor Stand') {
                        const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 && e.mobType !== 'Armor Stand'
                        
                        //Get info about the closest mob
                        try {
                            global.mob = bot.nearestEntity(mobFilter);
                        } catch(err) {
                            console.log(`
                            An error occurred while attempting to get info to attack a mob.

                            This error is not critical so the process will not be terminated
                            
                            
                            The error:`+err);
                        };

                        //Return if mob is undefined
                        if (!mob) return
                        try {
                            global.pos = mob.position
                        } catch(err) {
                            console.log(`
                            An error occurred while attempting to get info to attack a mob.
    
                            This error is not critical so the process will not be terminated
                                
                                
                            The error:`+err);
                        };
        
                        bot.lookAt(pos, true, () => {
                            bot.setControlState('jump', true);
        
                            setTimeout(() => {
                                bot.attack(mob);
                            }, 500);
        
                            bot.setControlState('jump', false);
                        });
                    };
                });
            };

            //Function to send a Windows notif
            function notifierSend(title, message)
            {
                notifier.notify({
                    title: `${title}`,
                    message: (`${message}`),
                    icon: 'projectlogo.jpg'
                }, (err) => {
                    if (err) {
                        console.log(chalk.redBright(` <STATUS> Couldn't send Windows Notification: `)+err)
                    } else {
                        console.log(chalk.greenBright(` <STATUS> Sent Windows Notification`))
                    };
                });
            };

            //Embed constructor function
            function embedConstructor(message, name, value, name2, value2, name3, value3)
            {
                const returnedEmbed = new Discord.MessageEmbed()
                .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
                .setColor(announcements.discordBot.embedHexColor)
                .setDescription(message)
                .addFields(
                    { name: name, value: value},
                )
                .setFooter(`${bot.username}`);

                if (name2 && value2) {
                    returnedEmbed.addFields({ name: name2, value: value2 });
                };

                if (name3 && value3) {
                    returnedEmbed.addFields({ name: name3, value: value3 });
                };

                return returnedEmbed
            };
        }); 
    };
};
