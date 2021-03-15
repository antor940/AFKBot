function startBotFunctions()
{
    const config = require('../config.json');
    const { bot, mcData, startBot } = require('./Bot');
    const { startViewer } = require('./Viewer');
    const { Discord, client, channel, errEmbed } = require('./Discord');
    const { commandList } = require('./DiscordFunctions');
    const { sendNotification } = require('./Windows');
    const { autoEat, enablePlugin, disablePlugin } = require('./Eat');
    const { fieldEmbed } = require('./Embed');
    const { logToFile } = require('../index');
    
    //Minecraft
    logToFile('<src/BotFunctions.js> Started', dir);
    logToFile('<src/BotFunctions.js> Starting functions', dir);
    if (config.debug) log(`<src/EventFunctions.js> load functions`);
    if (config['notify-on-user'].enable) notifyUsers();
    if (config.whispers['enable-answer']) autoWhisper();
    if (config.logs['log-chat-to-file']) logChat();
    if (config['auto-eat'].enable) autoEat();
    if (config['misc-options']['look-entities']) autoLook();
    if (config.pvp.enable) autoPvP();
    if (config['misc-options']['antikick-jump']) antiKick();
    if (config['message-on-interval'].enable) intervalMessage();
    if (config.viewer.enable) startViewer();
    
    if (config.debug) log(`<src/BotFunctions.js> load resource pack`);
    bot.on('error', (err) =>
    {
        errEmbed(err, `- This was caused by something that interacted with the bot\n - If it persists, please report in on Discord or create an issue`);
    });

    bot._client.on('resource_pack_send', () =>
    {
        logToFile('<src/BotFunctions.js> Loading resource pack', dir);
        bot._client.write('resource_pack_receive',
        {
            result: 3
        });
    
        bot._client.write('resource_pack_receive',
        {
            result: 0
        });
    });
    
    if (config.debug) log(`<src/BotFunctions.js> load events`);
    bot.on('message', (message) =>
    {
        if (config.logs['log-chat-to-console']) console.log(`<CHAT> ${message.toAnsi()}`);
    
        if (!config['misc-options']['send-chat-to-ds']) return;
        channel.send(`<CHAT> ${message.toString()}`);
    });
    
    let pauseOnSent = false;
    let onConnectDont = true;
    bot.once('health', async () =>
    {
        const embedArr = [
            {
                name: 'Time',
                value: bot.time.timeOfDay
            },
            {
                name: 'Spawn position',
                value: `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`
            },
            {
                name: 'Health',
                value: Math.floor(bot.health)
            }
        ];

        await fieldEmbed('Bot started', embedArr, '');
        logToFile('<src/BotFunctions.js> Sent botStartEmbed', dir);
        
        setTimeout(() => {
            onConnectDont = false;
        }, 10000);
    });
    
    bot.on('health', async () =>
    {
        if (bot.health < config['low-health']['health-points'] && bot.health > 0)
        {
            if (pauseOnSent) return;
            if (!config['low-health']['warn-on-low-health']) return;
            const embedArr = [
                {
                    name: 'Health',
                    value: `Below or equal to ${Math.floor(bot.health)}, bot will disconnect if the setting is enabled in the config`
                }
            ];
    
            await fieldEmbed('Bot warning', embedArr, '');
            logToFile('<src/BotFunctions.js> Sent healthWarnEmbed', dir);
            pauseOnSent = true;
    
            if (config['low-health']['disconnect-on-low-health'] && !onConnectDont) process.exit(1);
    
            setTimeout(() => {
                pauseOnSent = false;
            }, 10000);
        };
    });
    
    bot.on('kicked', async (reason) =>
    {
        if (reason.match(/(banned)/ig))
        {
            console.log(`Banned from the server: ${reason}`);
            const embedArr = [
                {
                    name: 'Warning',
                    value: `Banned from the server: ${reason}`
                }
            ];
    
            await fieldEmbed('Bot warning', embedArr, '');
            logToFile('<src/BotFunctions.js> Banned, shutting down', dir);
            if (config['windows-notifications']['on-banned']) await sendNotification('Banned', reason);
            process.exit(1);
        }
        else
        {
            console.log(`Kicked from the server: ${reason}`);
            const embedArr = [
                {
                    name: 'Warning',
                    value: `Kicked from the server, reconnecting in ${config.timeouts['on-kicked']/1000} seconds. Reason: ${reason}`
                }
            ];
    
            await fieldEmbed('Bot warning', embedArr, '');
            logToFile(`<src/BotFunctions.js> Kicked, reconnecting in ${config.timeouts['on-kicked']/1000} seconds`, dir);
            if (config['windows-notifications']['on-kicked']) sendNotification('Kicked', reason);
            port++;
            
            setTimeout(() => {
                startBot();    
            }, config.timeouts['on-kicked']);
            
        };
    });
    
    bot.inventory.on('windowUpdate', () =>
    {
        const foodArray = bot.inventory.items().filter(itemToFind => mcData.foodsArray.find(item => item.name === itemToFind.name));
        if (!foodArray.length)
        {
            disablePlugin();
        }
        else if (foodArray.length)
        {
            enablePlugin();
        };
    });
    
    let bloodhoundInfo = {};
    bot.on('onCorrelateAttack', (attacker, victim, weapon) =>
    {
        if (weapon)
        {
            bloodhoundInfo = {
                attacker: attacker,
                victim: victim,
                weapon: weapon
            };  
        }
        else
        {
            bloodhoundInfo = {
                attacker: attacker,
                victim: victim
            };
        };
    });
    
    bot.on('death', async () =>
    {
        const embedArr = [];

        if (config.bloodhound.enable && bloodhoundInfo.attacker) embedArr.push({ name: `Killed by`, value: bloodhoundInfo.attacker.username || bloodhoundInfo.weapon.name });
        if (config.bloodhound.enable && bloodhoundInfo.weapon) embedArr.push({ name: `Weapon`, value: bloodhoundInfo.weapon.name || bloodhoundInfo.weapon.displayName });
    
        if (config.bloodhound.enable) await fieldEmbed('Bot warning', embedArr, 'Died or killed');
        logToFile('<src/BotFunctions.js> Will send bloodhoundEmbed if specified', dir);
        if (config['windows-notifications']['on-death']) sendNotification('Warning', 'Died or killed');
    });
    
    if (config.debug) log(`<src/BotFunctions.js> load functions`);
    function notifyUsers()
    {
        logToFile('<src/BotFunctions.js> notifyUsers loaded', dir);
        bot.on('playerJoined', async (player) =>
        {
            if (config['notify-on-user'].list.includes(player.username))
            {
                const embedArr = [
                    {
                        name: 'Player that joined',
                        value: player.username
                    }
                ];

                await fieldEmbed('Specified player joined', embedArr, 'A player specified in the config has joined');
            };
        });
    };
    
    function autoLook()
    {
        logToFile('<src/BotFunctions.js> autoLook loaded', dir);
        bot.on('entityMoved', (entity) =>
        {
            if (bot.pathfinder.isMoving()) return;
            if (entity.type !== 'player' || bot.entity.position.distanceTo(entity.position) > 5) return;
            bot.lookAt(entity.position.offset(0, 1.6, 0));
        });
    };
    
    function autoPvP()
    {
        logToFile('<src/BotFunctions.js> autoPvP loaded', dir);
        bot.on('entityMoved', (entity) =>
        {
            if (!config.pvp.enable || bot.entity.position.distanceTo(entity.position) > 5 || bot.pathfinder.isMoving()) return;
            if (!config.pvp['attack-endermans'] && entity.mobType === 'Enderman') return;
            if (config.pvp['attack-players'])
            {
                if (entity.type === 'player')
                {
                    bot.pvp.attack(entity);
                };
            };
        
            if (entity.kind === 'Hostile mobs')
            {
                bot.pvp.attack(entity);
            };
        });
    };
    
    function antiKick()
    {
        logToFile('<src/BotFunctions.js> antiKick loaded', dir);
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => {
                bot.setControlState('jump', false);    
            }, 250);
        }, config.timeouts['antikick-jump-interval']);
    };
    
    function intervalMessage()
    {
        try
        {
            logToFile('<src/BotFunctions.js> intervalMessage loaded', dir);
            setInterval(() => {
                bot.chat(config['message-on-interval'].message);
            }, config['message-on-interval'].interval);
        }
        catch (err)
        {
            logToFile(`<src/BotFunctions.js> Error: ${err}`, dir);
            errEmbed(err, `- Check the config for the message-interval`);
        };
    };
    
    function logChat()
    {
        bot.on('message', (message) =>
        {
            logToFile(message, 'chat.log');
        });
    };
    
    function autoWhisper()
    {
        bot.on('whisper', (username) =>
        {
            setTimeout(() => {
                bot.whisper(username, config.whispers['message-to-answer']);
            }, config.whispers['timeout-on-whisper']);
        });
    };
    
    //Discord
    if (config.debug) log(`<src/BotFunctions.js> load discord event`);
    client.on('message', (message) =>
    {
        if (message.cleanContent.startsWith(`${config.discord.prefix}say `))
        {
            if (config.discord['send-chat-to-minecraft']) return;
            const msgToSay = message.cleanContent.replace(`${config.discord.prefix}say `, '');
            bot.chat(msgToSay);
        };
    
        if (message.cleanContent.includes(`${config.discord.prefix}follow`) || message.cleanContent.includes(`${config.discord.prefix}goto`)) return;
        if (!config.discord['send-chat-to-minecraft'] || commandList.indexOf(message.cleanContent) >= 0 || message.author.bot) return;
        bot.chat(message.cleanContent);
    });
};

module.exports = {
    startBotFunctions
};
