const config = require('../config.json');
const { bot, mcData } = require('./Bot');
const { fieldEmbed } = require('./Embed');
const { logToLog } = require('./Logging');

let alreadyEnabled = true;
let alreadyDisabled = false;
logToLog('<src/Eat.js> Passed');

async function autoEat()
{
    logToLog('<src/Eat.js/Function autoEat> Passed');
    const foodArray = bot.inventory.items().filter(item => mcData.foodsArray.indexOf(item.name) && !mcData.foodsArray.indexOf(config['auto-eat']['banned-foods']));
    
    if (!foodArray.length)
    {
        disablePlugin();
    };

    bot.autoEat.options =
    {
        priority: config['auto-eat'].priority,
        startAt: config['auto-eat']['start-at'],
        bannedFood: config['auto-eat']['banned-foods'],
    };
};

async function enablePlugin()
{
    if (alreadyEnabled) return;
    alreadyEnabled = true;
    alreadyDisabled = false;
    bot.autoEat.enable();
    logToLog('<src/Eat.js/Function enablePlugin> Passed');

    const fieldArr = [
        {
            name: 'Status',
            value: 'Bot received food, enabling plugin again'
        }
    ];

    if (config['auto-eat']['send-status']) await fieldEmbed('Bot status', fieldArr, '');
};

async function disablePlugin()
{
    if (alreadyDisabled) return;
    alreadyDisabled = true;
    alreadyEnabled = false;
    bot.autoEat.disable();
    logToLog('<src/Eat.js/Function disablePlugin> Passed');

    const fieldArr = [
        {
            name: 'Warning',
            value: `Bot doesn't have food for the autoeat plugin, the bot will enable the plugin again when it detects it has received food`
        }
    ];

    if (config['auto-eat']['send-status']) await fieldEmbed('Bot warning', fieldArr, '');
};

module.exports = {
    autoEat,
    enablePlugin,
    disablePlugin
};