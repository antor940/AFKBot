const config = require('../config.json');
const { errEmbed } = require('./Discord');
const { logToFile } = require('../index');
let stopFishingNow = false;
let fishingNow = false;

logToFile('<src/Fishing.js> Started', dir);
if (config.debug) log('<src/Fishing.js> started');
async function autoFish()
{
    try
    {
        if (config.debug) log('<src/Fishing.js> started autoFish');
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

        logToFile(`<src/Fishing.js> Error: ${err}`, dir);
        errEmbed(err, '- Start the bot before\n - Give the bot a fishing rod\n - Wait and send the command again');
        stopFishingNow = false;
        fishingNow = false;
    };
};

function stopFishing()
{
    if (config.debug) log('<src/Fishing.js> stopped autoFish');
    logToFile('<src/Fishing.js> stopFishing executed', dir);
    const { bot } = require('./Bot');
    if (!fishingNow) return;
    bot.activateItem();
    stopFishingNow = true;
};

module.exports = {
    autoFish,
    stopFishing
};