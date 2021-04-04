const config = require('../../config.json');
const errors = require('../data/errors.json');

const { errEmbed } = require('./Discord');
const { stopRandomMove, moveRandom } = require('./AntiKick');

const { fieldEmbed } = require('../utils/Embed');
const { logToLog } = require('../utils/Logging');

logToLog('<src/modules/Pathfind.js> Passed');
async function followPlayer(username)
{
    logToLog('<src/modules/Pathfind.js/Function followPlayer> Passed');
    try
    {
        const { bot, goals } = require('./Bot');
        const playerToFollow = bot.players[username].entity;

        await bot.pvp.stop();
        await bot.pathfinder.setGoal(null);
        stopRandomMove();
        bot.removeAllListeners('goal_reached');
        bot.on('diggingCompleted', () => bot.removeAllListeners('diggingCompleted'));
        bot.on('diggingAborted', () => bot.removeAllListeners('diggingAborted'));
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
        logToLog(`<src/modules/Pathfind.js/ERROR Function followPlayer> ERROR: ${err}`);
        if (err.toString().includes('players')) err = errors.pathfind['TypeError: Cannot read property \'players\' of undefined'];
        if (err.toString().includes('entity')) err = errors.pathfind['TypeError: Cannot read property \'entity\' of undefined'];
        if (err.toString().includes('position')) err = errors.pathfind['TypeError: Cannot read property \'position\' of null'];
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

let alreadyPathfinding = false;
async function gotoCoord(vec3)
{
    if (alreadyPathfinding) return;
    logToLog('<src/modules/Pathfind.js/Function gotoCoord> Passed');
    try
    {
        const { bot, goals } = require('./Bot');

        await bot.pvp.stop();
        stopRandomMove();
        alreadyPathfinding = true;
        bot.pathfinder.setGoal(new goals.GoalBlock(vec3.x, vec3.y, vec3.z));
        bot.once('goal_reached', () =>
        {
            alreadyPathfinding = false;
            moveRandom();
        });
    }
    catch (err)
    {
        logToLog(`<src/modules/Pathfind.js/ERROR Function gotoCoord> ERROR: ${err}`);
    };
};

async function stopPathfind()
{
    logToLog('<src/modules/Pathfind.js/Function stopPathfind> Passed');
    try
    {
        const { bot } = require('./Bot');
        await bot.pathfinder.setGoal(null);
        alreadyPathfinding = false;
        moveRandom();
    }
    catch (err)
    {
        logToLog(`<src/modules/Pathfind.js/ERROR Function stopPathfind> ERROR: ${err}`);
        errEmbed(errors.pathfind['TypeError: Cannot read property \'pathfinder\' of undefined'], `- Start the bot before using this command`);
    };
};

module.exports = {
    followPlayer,
    gotoCoord,
    stopPathfind
};