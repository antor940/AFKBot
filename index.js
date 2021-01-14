//Clear output
console.clear();

const mineflayer = require('mineflayer');
const notifier = require('node-notifier');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalFollow } = require('mineflayer-pathfinder').goals
const autoeat = require('mineflayer-auto-eat');
const fetch = require('node-fetch');
const { server, botOptions, announcements, misc, timeouts } = require('./config.json');
const { toDiscord, toMinecraft, whisperHandler } = require('./src/messageHandler');
const { followOwner, notifierSend, attackMobs, embedConstructor, antiAFK, lookNearEntity } = require('./src/miscFunctions');
const { printError } = require('./src/errorHandler');
const Discord = require('discord.js');
const chalk = require('chalk');

//Run main function
startBot();

function startBot()
{
    var alreadyJoined = false;
    var alreadyLeft = true;
    var leaveOnCommand = false;
    var attackUser;
    var executed = false;
    global.pathfindNow = false;
    

    if (!announcements.discordBot.token || !announcements.discordBot.channelID || !announcements.discordBot.prefix) {
        //Return on missing info
        console.log(chalk.blueBright('\n   <DISCORD> Please specify a Discord Token, a Discord Channel ID and a Prefix'));
        process.exit(1);
    } else {
        //Start Client
        global.client = new Discord.Client();
        client.login(announcements.discordBot.token);

        client.on('ready', async() => {
            global.channel = client.channels.cache.get(announcements.discordBot.channelID)

            var uuidOwner
            
            try {
                await fetch(`https://api.mojang.com/users/profiles/minecraft/${botOptions.username}`)
                .then(res => res.json())
                .then(player => uuidOwner = player);
            } catch(err) {
                printError(`An error occurred when attempting to check the username:
                This is because either there was and error at the Mojand API,
                or the username was incorrect.
                The process was not terminated because the error is not critical,
                so you can attempt to resolve the error and
                try again without restart
                
                ERROR:
                `, err.type, false, channel);
            };

            const clientReadyEmbed = new Discord.MessageEmbed()
            .setColor(announcements.discordBot.embedHexColor)
            .setAuthor(`AFKBot`, client.user.avatarURL(), 'https://github.com/DrMoraschi/AFKBot')
            .setDescription(`__Commands__`)
            .addFields(
                { name: `${announcements.discordBot.prefix}join`, value: `_Makes the bot join the server_`},
                { name: `${announcements.discordBot.prefix}leave`, value: `_Makes the bot leave the server_`},
                { name: `${announcements.discordBot.prefix}say [message]`, value: `_Sends [message] to Minecraft's chat. Disabled when sayEverything is true_`},
                { name: `${announcements.discordBot.prefix}follow`, value: `_Makes the bot follow the owner: ${misc.owner}_`},
                { name: `${announcements.discordBot.prefix}stop`, value: `_Stops the bot from following you_`},
                { name: `${announcements.discordBot.prefix}exit`, value: `_Stops the program_` },
            );
            
            if (uuidOwner) clientReadyEmbed.setThumbnail(`https://crafatar.com/renders/body/${uuidOwner.id}`);

            console.log(chalk.blueBright(` <DISCORD> Token found`));
            channel.send(clientReadyEmbed);

            client.on('message', (message) => {
                if (message.author.id === client.user.id || message.channel.id !== announcements.discordBot.channelID) return

                switch (message.content) {
                    case `${announcements.discordBot.prefix}join`:
                        if (alreadyJoined) return;
                        console.clear();
                        createThis();
                        break;
                    case `${announcements.discordBot.prefix}leave`:
                        if (alreadyLeft) return;
                        bot.quit();
                        channel.send(clientReadyEmbed);
                        alreadyLeft = true;
                        alreadyJoined = false;
                        leaveOnCommand = true;
                        break;
                    case `${announcements.discordBot.prefix}follow`:
                        if (alreadyLeft) return;
                        followOwner(bot,
                            Discord,
                            channel,
                            toDiscord,
                            announcements,
                            channel,
                            defaultMove,
                            GoalFollow,
                            misc.owner,
                            printError
                        );
                        break;
                    case `${announcements.discordBot.prefix}stop`:
                        if (alreadyLeft) return;
                        bot.pathfinder.setGoal(null);
                        pathfindNow = false;
                        const stopEmbed = embedConstructor(
                            bot,
                            Discord,
                            announcements,
                            ``,
                            `Pathfind:`,
                            `Target: None`
                        );
                        channel.send(stopEmbed);
                        break;
                    case `${announcements.discordBot.prefix}exit`:
                        process.exit();
                };

                if (message.content.startsWith(`${announcements.discordBot.prefix}say `)) {
                    if (alreadyLeft || announcements.discordBot.sayEverything) return;
                    const toSay = message.content.replace(`${announcements.discordBot.prefix}say `, '');

                    toMinecraft(bot, toSay);
                };

                if (!!announcements.discordBot.sayEverything && alreadyJoined) {
                    if (message.content === `${announcements.discordBot.prefix}join`
                    || message.content === `${announcements.discordBot.prefix}leave`
                    || message.content === `${announcements.discordBot.prefix}follow`
                    || message.content === `${announcements.discordBot.prefix}stop`
                    || message.content === `${announcements.discordBot.prefix}exit`
                    || message.content === `${announcements.discordBot.prefix}say`) return;

                    bot.chat(message.content);
                };
            });
        });
    };

    //Start MC Client function 
    function createThis()
    {
        //Create Bot with data from config file
        global.bot = mineflayer.createBot({
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
            alreadyLeft = false;
            alreadyJoined = true;

            //Init mcData, pathfinder
            const mcData = require('minecraft-data')(bot.version);
            global.defaultMove = new Movements(bot, mcData);
            defaultMove.allowFreeMotion = true
    
            //Call functions
            lookNearEntity(bot);
            antiAFK(bot, timeouts);
            //Check if config has !!misc.attackMobs enabled, and call !!misc.attackMobs function if true
            if (!!misc.attackMobs === true) attackMobs(bot, printError);
    
            //Configure autoeat
            bot.autoEat.options = {
                priority: `${misc.autoEat.priority}`,
                startAt: misc.autoEat.startAt,
                bannedFood: [],
            };
            
            //Get current players on server
            var playersList = Object.keys(bot.players).join(", ");
    
            console.log(chalk.blueBright(` <WORLD> Online players: `)+playersList);
            console.log(chalk.blueBright(` <WORLD> Current time: `)+Math.abs(bot.time.timeOfDay));
            console.log(chalk.greenBright(` <STATUS> Spawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
    
            //Runs when health or Hp change and sends a message in Discord
            bot.on('health', () => {
                if (bot.food === 20) {
                    bot.autoEat.disable();
                } else {
                    bot.autoEat.enable();
                };

                if (executed) return
                executed = true;

                const startEmbed =
                embedConstructor(
                    bot,
                    Discord,
                    announcements,
                    ``,
                    `Time`,
                    `${Math.abs(bot.time.timeOfDay)}`,
                    `Spawn position`,
                    `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`,
                    `Health`,
                    `${Math.floor(bot.health)}`
                );

                toDiscord(channel,
                    startEmbed
                );

                if (bot.health <= 5) {
                    console.log(chalk.yellowBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                } else {
                    console.log(chalk.greenBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                };
            });
            
            //Sends the message to the console
            bot.on('message', (msg) => {
                console.log(`${msg.toAnsi()}`);

                if (!!announcements.discordBot.sendChat) channel.send(`CHAT: ${msg.toString()}`);
            });

            //Runs when reciving a whisper
            bot.on('whisper', (username) => {
                whisperHandler(bot,
                    username,
                    botOptions,
                    announcements,
                    misc,
                    notifierSend,
                    notifier,
                    chalk
                );
            });
    
            //Runs when bot is kicked
            bot.on('kicked', (reason) => {
                if (leaveOnCommand === true) return
                //Parse response from server
                const reasonKicked = JSON.parse(reason);

                //Return if response empty
                if (!reasonKicked.extra) return

                if (reasonKicked.extra[0].text.includes('banned')) {
                    //Check if bot was banned
                    console.log(chalk.redBright(' <STATUS> I got banned. Exiting in 5 seconds...'));

                    if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Event Message', 'I got banned!');
            
                    //If discord message is to be sent, send it with ping or no ping based on config
                    const bannedEmbed =
                    embedConstructor(
                        bot,
                        Discord,
                        announcements,
                        `**I got banned. Exiting in 5 seconds**`,
                        `Reason`,
                        `${reasonKicked.extra[0].text}`
                    );

                    if (!!announcements.discordBot.userIDToPing) {
                        toDiscord(channel, bannedEmbed);

                        toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`);
                    } else {
                        toDiscord(channel, bannedEmbed);
                    };

                    //Exit process if banned 
                    setTimeout(() => {
                        process.exit(1);
                    }, 5000);
                } else {
                    //If message does not include banned, then tell user and attempt to connect again set timeout
                    console.log(chalk.redBright(` <STATUS> I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds. Reason: `)+reasonKicked.extra[0].text);
                    
                    if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Event Message', 'I got kicked!');
                
                    const kickedEmbed =
                    embedConstructor(
                        bot,
                        Discord,
                        announcements,
                        `**I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds**`,
                        `Reason`,
                        `${reasonKicked.extra[0].text}`
                    );
    
                    if (!!announcements.discordBot.userIDToPing) {
                        toDiscord(channel, kickedEmbed);

                        toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`);
                    } else {
                        toDiscord(channel, kickedEmbed);
                    };

                    //Reset bot and retry joining
                    setTimeout(() => {
                        createThis();
                    }, timeouts.onKicked);
                };
            });
            
            //Tell user when bot dies
            bot.on('death', () => {
                console.log(chalk.redBright(` <STATUS> I died!`));

                if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Event Message', 'I died!');
            });
    
            //Tell user where and when bot respawns
            bot.on('respawn', () => {
                if (!attackUser) {
                    attackUser = {
                        name: 'Error finding out',
                        displayName: 'Error finding out'
                    };
                };
                
                const respawnEmbed = 
                embedConstructor(
                    bot,
                    Discord,
                    announcements, 
                    `**I died**`,
                    `Respawn position`,
                    `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`,
                    `Last known attacker`,
                    `${(attackUser.displayName || attackUser.username)}`
                );
                    
                if (!!announcements.discordBot.userIDToPing) {
                    toDiscord(channel, respawnEmbed);

                    toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`)
                } else {
                    toDiscord(channel, respawnEmbed);
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

                attackUser = attacker
            });
        });
    };
};