const errors = require('../data/errors.json');

const { errEmbed } = require('./Discord');

const { logToLog } = require('../utils/Logging');

let stopFishingNow = false;
let fishingNow = false;

logToLog('<src/modules/Fishing.js> Passed');
async function autoFish()
{
    try
    {
        const { bot } = require('./Bot');
        if (stopFishingNow) return stopFishingNow = false;
        if (bot.inventory.emptySlotCount() === 0)
        {
            fishingNow = false;
            errEmbed('Inventory full', 'Interrupting fishing');
            return;
        };

        const fishingRodItem = bot.inventory.items().find(item => item.name.includes('_rod'));
        await bot.equip(fishingRodItem, 'hand');
    
        const waterBlock = bot.findBlock({
            maxDistance: 5,
            matching: (block) => block.name === 'water'
        });

        if (!waterBlock) return errEmbed('No water blocks in a radius of 5 blocks', '- Move the bot near water');

        fishingNow = true;
        await bot.lookAt(waterBlock.position.offset(0, 2, 0), false);
        await bot.fish();
        fishingNow = false;
        setTimeout(autoFish, 500);
    }
    catch (err)
    {
        if (err.message === 'Fishing cancelled')
        {
            stopFishingNow = false;
            fishingNow = false;
            return;
        };

        logToLog(`<src/modules/Fishing.js/ERROR Function autoFish> ERROR: ${err}`);
        errEmbed(errors.fishing['Error: Invalid item object in equip'], '- Start the bot before\n - Give the bot a fishing rod\n - Wait and send the command again');
        stopFishingNow = false;
        fishingNow = false;
    };
};

function stopFishing()
{
    logToLog('<src/modules/Fishing.js/Function stopFishing> Passed');
    const { bot } = require('./Bot');
    if (!fishingNow) return;
    bot.activateItem();
    stopFishingNow = true;
};

module.exports = {
    autoFish,
    stopFishing
};