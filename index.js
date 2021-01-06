console.clear()

const mineflayer = require('mineflayer');
const notifier = require('node-notifier');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat');
const { GoalFollow } = require('mineflayer-pathfinder').goals
const { server, botOptions, announcements, misc, timeouts } = require('./config.json');
const Discord = require('discord.js');
const chalk = require('chalk');

startBot();

function startBot()
{
    if (announcements.discordBot.sendMessage === true) {
        if (announcements.discordBot.webchannelUrl === '') {
    
            console.log(chalk.blueBright('\n   <DISCORD> Please specify a Discord Webchannel Url'));
            process.exit(1);
        } else {
    
            global.client = new Discord.Client();
            client.login(announcements.discordBot.token)
        };
    };

    const bot = mineflayer.createBot({
        host: server.host,
        username: botOptions.username ? botOptions.username : 'AFKBot',
        password: botOptions.password,
        hideErrors: true
    });

    bloodhoundPlugin(bot);
    bot.bloodhound.yaw_correlation_enabled = true

    bot.loadPlugin(pathfinder);

    bot.loadPlugin(autoeat);

    var pingOn
    if (!announcements.discordBot.userIDToPing) {
        pingOn = false
    } else {
        pingOn = true
    };

    const windowsNotification = announcements.windowsAnnouncements
    const botOwner = misc.owner
    const attackMob = misc.attackMob
    const sendToDS = announcements.discordBot.sendMessage

    bot.once('spawn', () => {
        const channel = client.channels.cache.get(announcements.discordBot.channelID)
        
        channel.send('**Spawned!**');

        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        defaultMove.allowFreeMotion = true
        bot.pathfinder.setMovements(defaultMove);

        lookNearEntity();
        if (attackMob === true) attackMobs();

        bot.autoEat.options = {
            priority: `${misc.autoEat.priority}`,
            startAt: misc.autoEat.startAt,
            bannedFood: [],
        };

        var playersList = Object.keys(bot.players).join(", ");

        if (sendToDS === true) console.log(chalk.blueBright(` <DISCORD> Token found`));
        console.log(chalk.blueBright(` <WORLD> Online players: `)+playersList);
        console.log(chalk.blueBright(` <WORLD> Current time: `)+Math.abs(bot.time.timeOfDay));

        console.log(chalk.greenBright(` <STATUS> Spawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
        
        client.on('message', (message) => {
            if (message.author.id === client.user.id) return
            if (message.channel.id !== announcements.discordBot.channelID) return
            if (message.content.startsWith(`${announcements.discordBot.prefix}`) === true) {
                const commandSplit = message.content.replace(`${announcements.discordBot.prefix}`, '')

                bot.chat(commandSplit)
            };
        });

        bot.once('health', () => {
            if (bot.health <= 5) {
                console.log(chalk.yellowBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
            } else {
                console.log(chalk.greenBright(` <STATUS> I have ${Math.floor(bot.health)} health.`));
            };
        });

        bot.on('health', () => {
            if (bot.food === 20) {
                bot.autoEat.disable();
            } else {
                bot.autoEat.enable();
            };
        });

        bot.on('message', (msg) => {
            if (sendToDS === true) channel.send(msg.toString());

            console.log(` ${msg.toAnsi()}`)
        });

        bot.on('whisper', (username, message) => {
            if (username === bot.username) return
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

                if (windowsNotification === true) notifierSend('Whisper Message', 'You have a new message');
            };
        });

        bot.on('kicked', (reason) => {
            const reasonKicked = JSON.parse(reason);

            console.log(chalk.redBright(' <STATUS> I got kicked.'));
            if (windowsNotification === true) notifierSend('Event Message', 'I got kicked!');
        
            if (sendToDS === true) {
                if (pingOn === true) {
                    channel.send(`<@${announcements.discordBot.userIDToPing}> **I got kicked!**`);
                } else {
                    channel.send(`**I got kicked!**`);
                };
            }; 
        
            setTimeout(() => {
                startBot();
            }, timeouts.onKicked);
        
            if (!reasonKicked.extra) return
            if (reasonKicked.extra[0].text.includes('banned') === true) {
                console.log(chalk.redBright(' <STATUS> I got banned. Exiting in 5 seconds...'));
        
                if (sendToDS === true) {
                    if (pingOn === true) {
                        channel.send(`<@${announcements.discordBot.userIDToPing}> **I got banned! Exiting in 10 seconds...**`);
                    } else {
                        channel.send(`**I got banned! Exiting in 10 seconds...**`);
                    };
                };

                setTimeout(() => {
                    process.exit(1);
                }, 5000);
            };
        });

        bot.on('death', () => {
            console.log(chalk.redBright(` <STATUS> I died!`));
            if (windowsNotification === true) notifierSend('Event Message', 'I died!');
        
            if (sendToDS === true) {
                if (pingOn === true) {
                    channel.send(`<@${announcements.discordBot.userIDToPing}> **I died!**`);
                } else {
                    channel.send(`**I died!**`);
                };
            };
        });

        bot.on('respawn', () => {
            console.log(chalk.greenBright(` <STATUS> Respawned at x: ${chalk.white(Math.round(bot.entity.position.x))} y: ${chalk.white(Math.round(bot.entity.position.y))} z: ${chalk.white(Math.round(bot.entity.position.z))}`));
        });

        bot.on('onCorrelateAttack', function (attacker,victim,weapon) {
            if (bot.username === victim.username) {
                if (weapon) {
                    console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)} with a/an ${chalk.whiteBright(weapon.displayName)}`));
                } else {
                    console.log(chalk.yellowBright(` <STATUS> Got hurt by ${chalk.whiteBright(attacker.displayName || attacker.username)}`));
                };
            };
        });

        setInterval(() => {
            setTimeout(() => {
                bot.setControlState('jump', false);
            }, 100);
                bot.setControlState('jump', true);
        }, timeouts.antiAFK);

        function followbotOwner(playerToFollow, username)
        {
            bot.whisper(username, 'On my way');
            bot.pathfinder.setGoal(new GoalFollow(playerToFollow, 2), true);
        };

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

        function attackMobs()
        {
            bot.on('entityMoved', (entity) => {
                if (entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < 8 && entity.mobType !== 'Armor Stand') {
                    const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 && e.mobType !== 'Armor Stand'

                    const mob = bot.nearestEntity(mobFilter);
          
                    if (!mob) return
                    const pos = mob.position
    
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

        function notifierSend(title, message)
        {
            notifier.notify({
                title: `${title}`,
                message: (`${message}`),
                icon: 'projectlogo.jpg'
            });
        };
    });
};