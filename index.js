//Clear output
console.clear();

const mineflayer = require('mineflayer');
const notifier = require('node-notifier');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalFollow, GoalBlock } = require('mineflayer-pathfinder').goals
const autoeat = require('mineflayer-auto-eat');
const { server, botOptions, announcements, misc, timeouts } = require('./config.json');
const { toDiscord, toMinecraft, whisperHandler } = require('./src/messageHandler');
const { saySomething, followOwner, notifierSend, attackMobs, embedConstructor, antiAFK, lookNearEntity } = require('./src/miscFunctions');
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
    

    if (!announcements.discordBot.token || !announcements.discordBot.channelID || !announcements.discordBot.prefix)
    {
        //Return on missing info
        console.log(chalk.blueBright('\n   <DISCORD> Please specify a Discord Token, a Discord Channel ID and a Prefix'));
        process.exit(1);
    }
    else
    {
        //Start Client
        global.client = new Discord.Client();
        client.login(announcements.discordBot.token);

        client.on('ready', async() => {
            global.channel = client.channels.cache.get(announcements.discordBot.channelID)

            const clientReadyEmbed = new Discord.MessageEmbed()
            .setColor(announcements.discordBot.embedHexColor)
            .setAuthor(`AFKBot`, client.user.avatarURL(), 'https://github.com/DrMoraschi/AFKBot')
            .setDescription(`__Commands__`)
            .addFields(
                { name: `${announcements.discordBot.prefix}join`, value: `_Makes the bot join the server_`},
                { name: `${announcements.discordBot.prefix}leave`, value: `_Makes the bot leave the server_`},
                { name: `${announcements.discordBot.prefix}say [message]`, value: `_Sends [message] to Minecraft's chat. Disabled when sayEverything is true_`},
                { name: `${announcements.discordBot.prefix}goto [x] [y] [z]`, value: `_Makes the bot go those coordinates_`},
                { name: `${announcements.discordBot.prefix}follow`, value: `_Makes the bot follow the owner: ${misc.owner}_`},
                { name: `${announcements.discordBot.prefix}stop`, value: `_Stops the bot from following you or pathfinding in general_`},
                { name: `${announcements.discordBot.prefix}exit`, value: `_Stops the program_` },
            );

            console.log(chalk.blueBright(` <DISCORD> Token found`));

            try
            {
                channel.send(clientReadyEmbed);
            }
            catch(err)
            {
                printError(`An error occurred while attempting to send the starting embed:
                Something to check:
                - Make sure your channelID is correct
                - Make sure the bot has administrator perms
                - Make sure the bot has been invited to the server
        
                ERROR:    
                `, err, true, channel);
            };

            client.on('message', (message) =>
            {
                if (message.author.id === client.user.id || message.channel.id !== announcements.discordBot.channelID) return

                switch (message.content)
                {
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

                if (message.content.startsWith(`${announcements.discordBot.prefix}say `))
                {
                    if (alreadyLeft || announcements.discordBot.sayEverything) return;
                    const toSay = message.content.replace(`${announcements.discordBot.prefix}say `, '');

                    toMinecraft(bot, toSay);
                };

                if (message.content.startsWith(`${announcements.discordBot.prefix}goto `))
                {
                    if (alreadyLeft) return;
                    const coords = message.content.split(' ');

                    if (!coords[3]) return toDiscord(channel, '<ERROR> Please specify x, y, z');

                    pathfindNow = true;

                    bot.pathfinder.goto(new GoalBlock(coords[1], coords[2], coords[3]), () => {
                        pathfindNow = false;
                    });
                };

                if (!!announcements.discordBot.sayEverything && alreadyJoined)
                {
                    const indexCommands = [
                        `${announcements.discordBot.prefix}join`,
                        `${announcements.discordBot.prefix}leave`,
                        `${announcements.discordBot.prefix}follow`,
                        `${announcements.discordBot.prefix}stop`,
                        `${announcements.discordBot.prefix}exit`,
                        `${announcements.discordBot.prefix}say`
                    ];

                    if (indexCommands.indexOf(message.content) >= 1 || message.content.startsWith(`${announcements.discordBot.prefix}goto`)) return;
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
            auth: botOptions.authMethod.toLowerCase(),
            host: server.host,
            port: server.port,
            username: botOptions.username ? botOptions.username : 'AFKBot',
            password: botOptions.password ? botOptions.password : null
        });

        //Initiallize Plugins
        bloodhoundPlugin(bot);
        bot.bloodhound.yaw_correlation_enabled = true
    
        bot.loadPlugin(pathfinder);
    
        bot.loadPlugin(autoeat);
        
        //Executes when bot spawns
        bot.once('spawn', () =>
        {
            bot._client.on('resource_pack_send', () => {
                bot._client.write('resource_pack_receive', {
                    result: 3
                });

                bot._client.write('resource_pack_receive', {
                    result: 0
                });
            });

            alreadyLeft = false;
            alreadyJoined = true;

            //Init mcData, pathfinder
            const mcData = require('minecraft-data')(bot.version);
            global.defaultMove = new Movements(bot, mcData);
            defaultMove.allowFreeMotion = true
    
            //Call functions
            if (!!announcements.saySomething.enable) saySomething(bot, announcements.saySomething.interval, announcements.saySomething.lineToSay);
            if (!!misc.lookAtEntities) lookNearEntity(bot);
            antiAFK(bot, timeouts);
            //Check if config has !!misc.attackMobs enabled, and call !!misc.attackMobs function if true
            if (!!misc.attackMobs) attackMobs(bot, printError);
    
            //Configure autoeat
            bot.autoEat.options =
            {
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
            bot.on('health', () =>
            {
                if (bot.food === 20)
                {
                    bot.autoEat.disable();
                }
                else
                {
                    try {
                        bot.autoEat.enable();
                    }
                    catch(err)
                    {
                        printError(`An error occurred while attempting to use the AutoEat Plugin:
                        Something to check:
                        - Make sure the bot has food
                        This error is not critical so the process will not be terminated
                
                        ERROR:    
                        `, err, false, channel);
                    };
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

                if (bot.health <= 5)
                {
                    console.log(chalk.yellowBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                } else {
                    console.log(chalk.greenBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
                };
            });
            
            //Sends the message to the console
            bot.on('message', (msg) =>
            {
                console.log(`${msg.toAnsi()}`);

                if (!!announcements.discordBot.sendChat) channel.send(`CHAT: ${msg.toString()}`);
            });

            //Runs when reciving a whisper
            bot.on('whisper', (username) =>
            {
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
            bot.on('kicked', (reason) =>
            {
                if (!!!misc.reconnectOnKick) return process.exit();

                if (leaveOnCommand) return;
                
                if (reason.toString().includes('ban'))
                {
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
                        `${reason}`
                    );

                    if (!!announcements.discordBot.userIDToPing)
                    {
                        toDiscord(channel, bannedEmbed);

                        toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`);
                    }
                    else
                    {
                        toDiscord(channel, bannedEmbed);
                    };

                    //Exit process if banned 
                    setTimeout(() =>{
                        process.exit(1);
                    }, 5000);
                }
                else
                {
                    //Attempt to connect again
                    console.log(chalk.redBright(` <STATUS> I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds.`));
                                        
                    if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Event Message', 'I got kicked!');

                    const kickedEmbed =
                    embedConstructor(
                        bot,
                        Discord,
                        announcements,
                        `**I got kicked. Reconnecting in ${timeouts.onKicked/1000} seconds**`,
                        `Reason`,
                        `${reason.toString()}`
                    );

                    if (!!announcements.discordBot.userIDToPing)
                    {
                        toDiscord(channel, kickedEmbed);

                        toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`);
                    }
                    else
                    {
                        toDiscord(channel, kickedEmbed);
                    };

                    //Reset bot and retry joining
                    setTimeout(() => {
                        createThis();
                    }, timeouts.onKicked);
                };
            });
            
            //Tell user when bot dies
            bot.on('death', () =>
            {
                console.log(chalk.redBright(` <STATUS> I died!`));

                if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Event Message', 'I died!');
            });
    
            //Tell user where and when bot respawns
            bot.on('respawn', () =>
            {
                if (!attackUser)
                {
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
                    
                if (!!announcements.discordBot.userIDToPing)
                {
                    toDiscord(channel, respawnEmbed);

                    toDiscord(channel, `^ <@${announcements.discordBot.userIDToPing}> ^`)
                }
                else
                {
                    toDiscord(channel, respawnEmbed);
                };

                console.log(chalk.greenBright(` <STATUS> Respawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
            });
            
            //When attacked inform user of attacker, who was attacked and with what
            bot.on('onCorrelateAttack', (attacker, victim, weapon) =>
            {
                if (bot.username === victim.username) {
                    if (weapon)
                    {
                        console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)} with a/an ${chalk.whiteBright(weapon.displayName)}`));
                    }
                    else
                    {
                        console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)}`));
                    };
                };

                attackUser = attacker
            });
        });
    };
};