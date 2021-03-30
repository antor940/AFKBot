const config = require('../../config.json');

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const autoeat = require('mineflayer-auto-eat');
const bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
const mineflayerViewer = require('prismarine-viewer').mineflayer;

const { startBotFunctions } = require('./BotFunctions');

const { registerBot, loginBot } = require('../modules/Login');
const { logToLog } = require('../utils/Logging');

logToLog('<src/modules/Bot.js> Passed');
function startBot()
{
    logToLog('<src/modules/Bot.js/Function startBot> Passed');
    return new Promise((resolve, reject) =>
    {
        const bot = mineflayer.createBot({
            host: config.server.host,
            port: config.server.port ? config.server.port: 25565,
            username: config.afkbot.username ? config.afkbot.username: 'AFKBot',
            password: config.afkbot.password ? config.afkbot.password: null,
            auth: config.afkbot['auth-method'] ? config.afkbot['auth-method']: 'mojang',
        });

        bot.on('error', (err) => reject(err));
        bot.on('kicked', (reason) => reject(reason));

        bot.once('spawn', () =>
        {
            const mcData = require('minecraft-data')(bot.version);
            bot.loadPlugin(pathfinder);
            bot.loadPlugin(pvp);
            bot.loadPlugin(autoeat);
            bot.loadPlugin(bloodhoundPlugin);

            const defaultMove = new Movements(bot, mcData);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.movements.maxDropDown = config.pathfind['max-dropdown-blocks'];
            bot.pathfinder.movements.scafoldingBlocks = [];
            config.pathfind['scaffolding-blocks'].forEach(block =>
                {
                    bot.pathfinder.movements.scafoldingBlocks.push(mcData.itemsByName[block].id);
                });
            bot.pvp.followRange = 10000;
            bot.pvp.attackRange = 5;
            bot.bloodhound.yaw_correlation_enabled = true;

            bot.chatAddPattern(/(register)/ig, 'registerPattern', 'On register');
            bot.chatAddPattern(/(login)/ig, 'loginPattern', 'On login');

            bot.on('registerPattern', registerBot);
            bot.on('loginPattern', loginBot);

            module.exports = {
                bot,
                mcData,
                goals,
                mineflayerViewer,
                startBot
            };

            logToLog('<src/modules/Bot.js/Event once spawn> Passed');
            startBotFunctions();
            return resolve(bot);
        });
    });
};

module.exports = {
    startBot
};