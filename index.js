const mineflayer = require('mineflayer');
const notifier = require('node-notifier');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat');
const { GoalFollow } = require('mineflayer-pathfinder').goals
const { server, botOptions, announcements, misc, timeouts } = require('./config.json');
const Discord = require('discord.js');
const chalk = require('chalk');


// run main function
startBot();

function startBot()
{   
    // Clear output
    console.clear();
    //Check config for sendMessage var and initialize Discord bot
    if (announcements.discordBot.sendMessage === true) {
        // Ensure that user included essential information for bot
        if (announcements.discordBot.token === '' || announcements.discordBot.channelID === '') {
            // Return error if missing info
            console.log(chalk.blueBright('\n   <DISCORD> Please specify a Discord Token and a Discord Channel ID'));
            process.exit(1);
        } else {
            //Create client and login
            global.client = new Discord.Client();
            client.login(announcements.discordBot.token)
        };
    };
    // Check sendMessage again for same condition
    // TODO: remove redundant if statement
    if (announcements.discordBot.sendMessage === true) {
        //Wait for Discord client to emit ready event
        //Else starts bot anyway
        client.on('ready', () => {
            //Start MC Client
            createThis();
        });

    } else {
        // Start MC Client
        createThis();
    };
   //Start MC Client function 
    function createThis()
    {
        //create Bot with data from config file
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
        
        //TODO: remove redefinitions
        //Switch to just using the objects created from json parse
        var pingOn = !!announcements.discordBot.userIDToPing;
        //removed if statement and replaced with direct declaration
        // Double ! to ensure boolean definition
        
        //More redefinitions
        const windowsNotification = announcements.windowsAnnouncements
        const botOwner = misc.owner
        const attackMob = misc.attackMobs
        const sendToDS = announcements.discordBot.sendMessage
        
        //create a channel constant
        var channel;
        
        //Executes when bot spawns
        bot.once('spawn', () => {
            try{
                if(sendToDS){
                const channel = client.channels.cache.get(announcements.discordBot.channelID)
                }
            }catch(err){
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
    
            // Call function to look at nearest entity
            lookNearEntity();
            
            //Check if config has attackMob enabled, and call attackMobs function if true
            if (attackMob === true) attackMobs();
    
            //Configure autoeat
            bot.autoEat.options = {
                priority: `${misc.autoEat.priority}`,
                startAt: misc.autoEat.startAt,
                bannedFood: [],
            };
            
            //Get current players on server
            var playersList = Object.keys(bot.players).join(", ");
    
            if (sendToDS) console.log(chalk.blueBright(` <DISCORD> Token found`));
            console.log(chalk.blueBright(` <WORLD> Online players: `)+playersList);
            
            console.log(chalk.blueBright(` <WORLD> Current time: `)+Math.abs(bot.time.timeOfDay));
    
            console.log(chalk.greenBright(` <STATUS> Spawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
            
            //transmits discord chat to ingame

            if (sendToDS) {
                client.on('message', (message) => {
                    if (message.author.id === client.user.id) return
                    if (message.channel.id !== announcements.discordBot.channelID) return
                    if (message.content.startsWith(`${announcements.discordBot.prefix}`) === true) {
                        if (announcements.discordBot.prefix === '') {
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
                const startEmbed = new Discord.MessageEmbed()
                .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
                .setColor(announcements.discordBot.embedHexColor)
                .addFields(
                    { name: `Time`, value: `${Math.abs(bot.time.timeOfDay)}`},
                    { name: `Spawn position`, value: `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`},
                    { name: `Health`, value: `${Math.floor(bot.health)}`}
                )
                .setFooter(`${bot.username}`);

                if (sendToDS) channel.send(startEmbed)

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
                if (sendToDS) channel.send(`<CHAT> `+msg.toString());
    
                console.log(` ${msg.toAnsi()}`)
            });
            //runs when reciving a whisper
            bot.on('whisper', (username, message) => {
                if (username === bot.username) return
                
                try{
                const playerToFollow = bot.players[username].entity
                
                if (username === botOwner) {
                    switch (message) {
                        case `follow me`:
                            followbotOwner(playerToFollow, username);
                            break
                        case `stop`:
                            bot.pathfinder.setGoal(null);
                            break
                    };
                } else if (username !== botOwner) {
                    bot.whisper(username, 'Sorry, I am an AFK Bot');
                    console.log(chalk.greenBright(' <STATUS> Whispered that I am a bot'));
    
                    if (windowsNotification) notifierSend('Whisper Message', 'You have a new message');
                };
            }catch(err){
                console.log(`An error occurred when attempting to pathfind:
                Something to check:
                Make sure you are close to the bot
                Make sure the bot is not already pathfinding to something

                The process was not terminated because the error is not critical, so you can attempt to resolve the error and 
                try again without restart

                Heres the error:    
                `+err);
            }
            //Error handling

            });
    
            //runs when bot is kicked
            bot.on('kicked', (reason) => {

                //parse response from server
                const reasonKicked = JSON.parse(reason);

                //return if response empty
                if (!reasonKicked.extra) return

                
                if (reasonKicked.extra[0].text.includes('banned') === true) {
                //check if bot was banned
                    console.log(chalk.redBright(' <STATUS> I got banned. Exiting in 5 seconds...'));
            
                    if (sendToDS) {
                        //If discord message is to be sent, send it with ping or no ping based on config
                        const bannedEmbed = embedConstructor(`**I got banned. Exiting in 5 seconds**`, `Reason`, `${reasonKicked.extra[0].text}`);

                        if (pingOn === true) {
                            if (sendToDS) channel.send(bannedEmbed);

                            if (sendToDS) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`);
                        } else {
                            if (sendToDS) channel.send(bannedEmbed);
                        };
                    };
                    //Exit process if banned 
                    setTimeout(() => {
                        process.exit(1);
                    }, 5000);
                } else {
                    //If message does not include banned, then tell user and attempt to connect again set timeout
                    console.log(chalk.redBright(` <STATUS> I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds. Reason: `)+reasonKicked.extra[0].text);
                    if (windowsNotification) notifierSend('Event Message', 'I got kicked!');
                
                    if (sendToDS) {
                        const kickedEmbed = embedConstructor(`**I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds**`, `Reason`, `${reasonKicked.extra[0].text}`);
    
                        if (pingOn === true) {
                            if (sendToDS) channel.send(kickedEmbed);
    
                            if (sendToDS) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`);
                        } else {
                            if (sendToDS) channel.send(kickedEmbed);
                        };
                    }; 
                    //Reset bot and retry joining
                    setTimeout(() => {
                        if (sendToDS) client.destroy();
                        startBot();
                    }, timeouts.onKicked);
                };
            });
            
            //Tell user when bot dies
            bot.on('death', () => {
                console.log(chalk.redBright(` <STATUS> I died!`));
                if (windowsNotification) notifierSend('Event Message', 'I died!');
            });
    
            //Tell user where and when bot respawns
            bot.on('respawn', () => {
                if (sendToDS) {
                    //embed construction function not used here?
                    const respawnEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
                    .setColor(announcements.discordBot.embedHexColor)
                    .setDescription(`**I died**`)
                    .addFields(
                        { name: `Respawn position`, value: `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`},
                        { name: `Last known attacker`, value: `${(attackUser.displayName || attackUser.username)}`},
                    )
                    .setFooter(`${bot.username}`);

                    if (pingOn) {
                        if (sendToDS) channel.send(respawnEmbed);

                        if (sendToDS) channel.send(`^ <@${announcements.discordBot.userIDToPing}> ^`)
                    } else {
                        if (sendToDS) channel.send(respawnEmbed);
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
            //set the anti afk timeout
            setInterval(() => {
                setTimeout(() => {
                    bot.setControlState('jump', false);
                }, 100);
                    bot.setControlState('jump', true);
            }, timeouts.antiAFK);
            
            //function to follow a person
            function followbotOwner(playerToFollow, username)
            {
                bot.whisper(username, 'On my way');
                bot.pathfinder.setGoal(new GoalFollow(playerToFollow, 2), true);
            };
            
            //function to look near an entity
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
            

            //function to attack mobs
            function attackMobs()
            {
                //look at a mob, and attack it when an entity moves
                bot.on('entityMoved', (entity) => {
                    if (entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < 8 && entity.mobType !== 'Armor Stand') {
                        const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 && e.mobType !== 'Armor Stand'
                        
                        
                        //get info about the closest mob
                        try{
                        const mob = bot.nearestEntity(mobFilter);
                        }catch(err){
                            console.log(`
                            An error occurred while attempting to get info to attack a mob.

                            This error is not critical so the process will not be terminated
                            
                            
                            The error:`+err);
                        }
                        //return if mob is undefined
                        if (!mob) return
                        try{
                            const pos = mob.position
                            }catch(err){
                                console.log(`
                                An error occurred while attempting to get info to attack a mob.
    
                                This error is not critical so the process will not be terminated
                                
                                
                                The error:`+err);
                            }
        
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
            //function to send a windows notif
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

            //embed constructor function
            function embedConstructor(message, name, value)
            {
                const returnedEmbed = new Discord.MessageEmbed()
                .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
                .setColor(announcements.discordBot.embedHexColor)
                .setDescription(message)
                .addFields(
                    { name: name, value: value},
                )
                .setFooter(`${bot.username}`);

                return returnedEmbed
            };
        }); 
    };
};
