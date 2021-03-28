const { errEmbed } = require('./Discord');

const { descEmbed } = require('../utils/Embed');
const { logInv, logToLog } = require('../utils/Logging');

logToLog('<src/modules/Inventory.js> Passed');
async function listInventory()
{
    try
    {
        const { bot } = require('./Bot');
        let botInv = bot.inventory.items().map(item => `${item.name} x ${item.count}`).join('\n');
        if (botInv.length > 2000) botInv = botInv.slice(1, 2000);
        if (!botInv) botInv = 'Inventory empty';
    
        await descEmbed('Bot inventory', botInv);
        logToLog('<src/modules/Inventory.js/Function listInventory> Passed');
    }
    catch (err)
    {
        logToLog(`<src/modules/Inventory.js/ERROR Function listInventory> ERROR: ${err}`);
        errEmbed(err, '- Start the bot before using this command\n- If the bot had started when this error ocurred, please report it as a bug');
    };
};

async function rawInventory()
{
    try
    {
        const { bot } = require('./Bot');
        let rawInv = JSON.stringify(bot.inventory.items(), null, 2);
        if (rawInv.length > 2000)
        {
            logInventory();
            rawInv = rawInv.slice(1, 1900);
        };

        await descEmbed('Raw Bot inventory', '```js\n'+rawInv+'\n```\nIf inventory is cut off, it\'s because of the Discord Character Limit, you can view the full message inside /files/InventoryJSON.json');
        logToLog('<src/modules/Inventory.js/Function rawInventory> Passed');

        async function logInventory()
        {
            await logInv(rawInv);
        };
    }
    catch (err)
    {
        logToLog(`<src/modules/Inventory.js/ERROR Function rawInventory> ERROR: ${err}`);
        errEmbed(err, '- Start the bot before using this command\n- If the bot had started when this error ocurred, please report it as a bug');
    };
};

function emptyInventory()
{
    try
    {
        logToLog('<src/modules/Inventory.js/Function emptyInventory> Passed');
        const { bot } = require('./Bot');

        tossEach();
        function tossEach()
        {
            if (bot.inventory.items().length === 0) return;
            bot.tossStack(bot.inventory.items()[0], (err) =>
            {
                if (err) 
                {
                    setTimeout(() => {
                        tossEach();
                    }, 1000);
                    return;
                };

                setTimeout(() => {
                    tossEach();
                }, 100);
            });
        };
    }
    catch (err)
    {
        logToLog(`<src/modules/Inventory.js/ERROR Function emptyInventory> ERROR: ${err}`);
        errEmbed(err, '- Start the bot before using this command\n- If the bot had started when this error ocurred, please report it as a bug');
    };
};

module.exports = {
    listInventory,
    rawInventory,
    emptyInventory
};
