const config = require('../../config.json');

const { once } = require('events');
const { Vec3 } = require('vec3');

const { logToLog } = require('../utils/Logging');
const { errEmbed } = require('./Discord');

let stopMining;
logToLog('<src/modules/Mining.js> Passed');
async function mineGenerator()
{
    logToLog('<src/modules/Mining.js/Function mineGenerator> Passed');
    try
    {
        stopMining = false;
        const { bot } = require('./Bot');
        
        const vec3ofBlock = new Vec3(config['block-generators']['block-to-break'].x, config['block-generators']['block-to-break'].y, config['block-generators']['block-to-break'].z);
        if (bot.entity.position.distanceTo(vec3ofBlock) > 10) return errEmbed(`Can't reach block`, '- Block is probably too far to break, check it in the config.json');
    
        mineBlock();
    
        async function mineBlock()
        {
            if (stopMining) return;
            const toolToEquip = bot.pathfinder.bestHarvestTool(bot.blockAt(vec3ofBlock));
            if (toolToEquip) await bot.equip(toolToEquip, 'hand');
            await bot.dig(bot.blockAt(vec3ofBlock), false);
            await once(bot, `blockUpdate:(${vec3ofBlock.x}, ${vec3ofBlock.y}, ${vec3ofBlock.z})`);
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

module.exports = {
    mineGenerator,
    stopGenerator
};