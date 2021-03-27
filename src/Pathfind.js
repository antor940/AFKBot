const config = require('../config.json');
const { errEmbed } = require('./Discord');
const { fieldEmbed } = require('./Embed');
const { logToLog } = require('./Logging');

logToLog('<src/Pathfind.js> Passed');
async function followPlayer(username)
{
    logToLog('<src/Pathfind.js/Function followPlayer> Passed');
    try
    {
        const { bot, goals } = require('./Bot');
        const playerToFollow = bot.players[username].entity;

        await bot.pvp.stop();
        await bot.pathfinder.setGoal(null);
        bot.removeAllListeners('goal_reached');
        bot.pathfinder.setGoal(new goals.GoalFollow(playerToFollow, config.pathfind['pathfind-range']), true);

        const fieldArr = [
            {
                name: 'Player',
                value: playerToFollow.username
            },
            {
                name: 'Position',
                value: `x: ${Math.floor(playerToFollow.position.x)} y: ${Math.floor(playerToFollow.position.y)} z: ${Math.floor(playerToFollow.position.z)}`
            }
        ];
        
        await fieldEmbed('Following', fieldArr, '');
    }
    catch (err)
    {
        logToLog(`<src/Pathfind.js/ERROR Function followPlayer> ERROR: ${err}`);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

async function gotoCoord(vec3)
{
    logToLog('<src/Pathfind.js/Function gotoCoord> Passed');
    try
    {
        const { bot, goals } = require('./Bot');

        await bot.pvp.stop();
        bot.removeAllListeners('goal_reached');
        bot.pathfinder.setGoal(new goals.GoalBlock(vec3.x, vec3.y, vec3.z));
    }
    catch (err)
    {
        logToLog(`<src/Pathfind.js/ERROR Function gotoCoord> ERROR: ${err}`);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

function stopPathfind()
{
    logToLog('<src/Pathfind.js/Function stopPathfind> Passed');
    try
    {
        const { bot } = require('./Bot');
        bot.pathfinder.setGoal(null);
        bot.removeAllListeners('goal_reached');
    }
    catch (err)
    {
        logToLog(`<src/Pathfind.js/ERROR Function stopPathfind> ERROR: ${err}`);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

module.exports = {
    followPlayer,
    gotoCoord,
    stopPathfind
};