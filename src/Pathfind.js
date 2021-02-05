const config = require('../config.json');
const { Discord, client, channel, errEmbed } = require('./Discord');
const { logToFile } = require('../index');

logToFile('<src/Pathfind.js> Started', dir);
if (config.debug) log(`<src/Pathfind.js> load pathfind`);
async function followPlayer(username)
{
    logToFile('<src/Pathfind.js> followPlayer started', dir);
    if (config.debug) log(`<src/Pathfind.js> start pathfind`);
    try
    {
        const { bot, goals } = require('./Bot');
        const playerToFollow = bot.players[username].entity;

        pathfindingNow = true;
        bot.pvp.stop();
        bot.pathfinder.setGoal(new goals.GoalFollow(playerToFollow, config.pathfind['pathfind-range']), true);
        bot.on('diggingAborted', () =>
        {
            bot.removeAllListeners('diggingAborted');
        });

        bot.on('diggingCompleted', () =>
        {
            bot.removeAllListeners('diggingCompleted');
        });

        const followEmbed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
        .setColor(config.discord['embed-hex-color'])
        .setTitle('Following')
        .setThumbnail(client.user.avatarURL())
        .addFields(
            { name: 'Player', value: playerToFollow.username, inline: true },
            { name: 'Position', value: `x: ${Math.floor(playerToFollow.position.x)} y: ${Math.floor(playerToFollow.position.y)} z: ${Math.floor(playerToFollow.position.z)} `, inline: true },
        );
        
        await channel.send(followEmbed);
    }
    catch (err)
    {
        logToFile(`<src/Pathfind.js> Error: ${err}`, dir);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

function gotoCoord(vec3)
{
    logToFile('<src/Pathfind.js> gotoCoord started', dir);
    if (config.debug) log(`<src/Pathfind.js> start goto`);
    try
    {
        const { bot, goals } = require('./Bot');
        bot.on('diggingAborted', () =>
        {
            bot.removeAllListeners('diggingAborted');
        });

        pathfindingNow = true;
        bot.pvp.stop();
        bot.pathfinder.goto(new goals.GoalBlock(vec3.x, vec3.y, vec3.z), () =>
        {
            pathfindingNow = false;
        });
    }
    catch (err)
    {
        logToFile(`<src/Pathfind.js> Error: ${err}`, dir);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

function stopPathfind()
{
    logToFile('<src/Pathfind.js> Stop pathfinding', dir);
    if (config.debug) log(`<src/Pathfind.js> stop pathfind`);
    try
    {
        pathfindingNow = false;
        const { bot } = require('./Bot');
        bot.pathfinder.setGoal(null);
    }
    catch (err)
    {
        logToFile(`<src/Pathfind.js> Error: ${err}`, dir);
        errEmbed(err, `- Start the bot before using this command\n- Write the username correctly`);
    };
};

module.exports = {
    followPlayer,
    gotoCoord,
    stopPathfind
};