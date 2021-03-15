const config = require('../config.json');
const { bot, mcData } = require('./Bot');
const { Discord, client, channel } = require('./Discord');
const { logToFile } = require('../index');
const { fieldEmbed } = require('./Embed');

let alreadyEnabled = true;
let alreadyDisabled = false;

async function autoEat()
{
    logToFile('<src/Eat.js> autoEat loaded', dir);
    if (config.debug) log(`<src/Eat.js> load autoEat`);
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
    logToFile('<src/Eat.js> autoEat enabled', dir);
    if (config.debug) log(`<src/Eat.js> enable autoEat`);

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
    logToFile('<src/Eat.js> autoEat disabled', dir);
    if (config.debug) log(`<src/Eat.js> disable autoEat`);

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