const config = require('../../config.json');

const { logToLog } = require('../utils/Logging');
const { errEmbed } = require('./Discord');

let vec3toClear;
let stopMining;
logToLog('<src/modules/Mining.js> Passed');
async function mineGenerator(vec3ofBlock)
{
    logToLog('<src/modules/Mining.js/Function mineGenerator> Passed');
    try
    {
        vec3toClear = vec3ofBlock;
        stopMining = false;
        const { bot } = require('./Bot');
        if (bot.entity.position.distanceTo(vec3ofBlock) > 10) return errEmbed(`Can't reach block`, '- Block is probably too far to break, check it in the config.json');
    
        mineBlock();
        async function mineBlock()
        {
            if (stopMining) return;
            if (bot.blockAt(vec3ofBlock).name === 'air')
            {
                await sleep(1000);
                return mineBlock();
            };
            
            const toolToEquip = bot.pathfinder.bestHarvestTool(bot.blockAt(vec3ofBlock));
            if (toolToEquip) await bot.equip(toolToEquip, 'hand');
            await bot.dig(bot.blockAt(vec3ofBlock), false);
            mineBlock();
        };
    }
    catch (err)
    {
        logToLog(`<src/modules/Mining.js/ERROR Function mineGenerator> ERROR: ${err}`);
    };
};

function stopGenerator()
{
    logToLog('<src/modules/Mining.js/Function stopGenerator> Passed');
    stopMining = true;
};

function sleep(ms)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
    mineGenerator,
    stopGenerator
};