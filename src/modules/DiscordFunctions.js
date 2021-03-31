const config = require('../../config.json');
const errors = require('../data/errors.json');

const { Vec3 } = require('vec3');

const { startBot } = require('./Bot');
const { followPlayer, gotoCoord, stopPathfind } = require('./Pathfind');
const { Discord, client, errEmbed, channel, guild } = require('./Discord');
const { autoFish, stopFishing } = require('./Fishing');
const { listInventory, rawInventory, emptyInventory } = require('./Inventory');
const { returnViewer } = require('./Viewer');
const { getStatus } = require('./Status');

const { clearLogFolder, logToLog } = require('../utils/Logging');
const { pingServer } = require('../utils/Ping');
const { fieldEmbed } = require('../utils/Embed');
const { mineGenerator, stopGenerator } = require('./Mining');

console.log(`<DISCORD> Logged in: ${client.user.tag}`);
if (config.discord['bot-rpc'].enable) client.user.setActivity(config.discord['bot-rpc'].text);

let commandList = [
    `${config.discord.prefix}help`,
    `${config.discord.prefix}ping`,
    `${config.discord.prefix}start`,
    `${config.discord.prefix}follow`,
    `${config.discord.prefix}stop`,
    `${config.discord.prefix}fish`,
    `${config.discord.prefix}stopfish`,
    `${config.discord.prefix}goto`,
    `${config.discord.prefix}list`,
    `${config.discord.prefix}empty`,
    `${config.discord.prefix}generator`,
    `${config.discord.prefix}stopgen`,
    `${config.discord.prefix}say`,
    `${config.discord.prefix}status`,
    `${config.discord.prefix}clearlogs`,
    `${config.discord.prefix}viewer`,
    `${config.discord.prefix}exit`,
    `${config.discord.prefix}rawinv`
];

const fieldArr = [
    { name: `${config.discord.prefix}help`, value: `Shows this command list` },
    { name: `${config.discord.prefix}ping`, value: `Ping the server specified in the config.json, returning the results`, inline: true },
    { name: `${config.discord.prefix}start`, value: `Start the bot`, inline: true },
    { name: `${config.discord.prefix}status`, value: `Status of the bot`, inline: true },
    { name: `${config.discord.prefix}follow [username]`, value: `Follows the player with the exact username`, inline: true },
    { name: `${config.discord.prefix}say [message]`, value: `Says [message] in chat. Disabled if "send-chat-to-minecraft" is set to true`, inline: true },
    { name: `${config.discord.prefix}fish`, value: `Start fishing and stop when inventory is full`, inline: true },
    { name: `${config.discord.prefix}stopfish`, value: `Stop fishing`, inline: true },
    { name: `${config.discord.prefix}goto [x] [y] [z]`, value: `Go to [x] [y] [z] coordinates`, inline: true },
    { name: `${config.discord.prefix}list`, value: `List inventory`, inline: true },
    { name: `${config.discord.prefix}rawinv`, value: `List raw inventory in JSON`, inline: true },
    { name: `${config.discord.prefix}empty`, value: `Empty inventory`, inline: true },
    { name: `${config.discord.prefix}generator`, value: `Breaks the block specified in the config continuously`, inline: true },
    { name: `${config.discord.prefix}stopgen`, value: `Stops the breaking process of the Generator command`, inline: true },
    { name: `${config.discord.prefix}viewer`, value: `Returns the port and the URL in which the current world viewer is running`, inline: true },
    { name: `${config.discord.prefix}clearlogs`, value: `Clears the logs folder`, inline: true },
    { name: `${config.discord.prefix}stop`, value: `Stops any kind of pathfinding`, inline: true },
    { name: `${config.discord.prefix}exit`, value: `Stops the program`, inline: true }
];
    
fieldEmbed('Commands', fieldArr, '');
logToLog('<src/modules/DiscordFunctions.js> Passed');

client.on('message', async (message) =>
{
    if (message.author.bot || message.channel.id !== config.discord['channel-id']) return;
    if (!guild.members.cache.get(message.author.id).roles.cache.has(config.discord['owner-role-id'])) return;
    switch (message.cleanContent)
    {
        case `${config.discord.prefix}help`:
            logToLog('<src/modules/DiscordFunctions.js/Case Help> Passed');
            fieldEmbed('Commands', fieldArr, '');
        break;
        case `${config.discord.prefix}ping`:
            logToLog('<src/modules/DiscordFunctions.js/Case Ping> Passed');
            pingServer();
        break;
        case `${config.discord.prefix}start`:
            logToLog('<src/modules/DiscordFunctions.js/Case Start> Passed');
            startBot()
            .catch(err =>
            {
                logToLog(`<src/modules/DiscordFunctions.js/ERROR Case Start> ERROR: ${err}`);
                errEmbed(`Couldn't start: ${errors.server['Error: connect ECONNREFUSED']}`, `- Check credentials, IP and Port\n - If error persists, ask on Discord or report it as a bug`);
            });
        break;
        case `${config.discord.prefix}status`:
            logToLog('<src/modules/DiscordFunctions.js/Case Status> Passed');
            getStatus().then(statusEmbed => channel.send(statusEmbed));
        break;
        case `${config.discord.prefix}fish`:
            logToLog('<src/modules/DiscordFunctions.js/Case Fish> Passed');
            autoFish();
        break;
        case `${config.discord.prefix}stopfish`:
            logToLog('<src/modules/DiscordFunctions.js/Case Stopfish> Passed');
            stopFishing();
        break;
        case `${config.discord.prefix}list`:
            logToLog('<src/modules/DiscordFunctions.js/Case List> Passed');
            listInventory();
        break;
        case `${config.discord.prefix}rawinv`:
            logToLog('<src/modules/DiscordFunctions.js/Case Rawinv> Passed');
            rawInventory();
        break;
        case `${config.discord.prefix}empty`:
            logToLog('<src/modules/DiscordFunctions.js/Case Empty> Passed');
            emptyInventory();
        break;
        case `${config.discord.prefix}viewer`:
            logToLog('<src/modules/DiscordFunctions.js/Case Viewer> Passed');
            returnViewer();
        break;
        case `${config.discord.prefix}generator`:
            logToLog('<src/modules/DiscordFunctions.js/Case Generator> Passed');
            mineGenerator();
        break;
        case `${config.discord.prefix}stopgen`:
            logToLog('<src/modules/DiscordFunctions.js/Case Stopgen> Passed');
            stopGenerator();
        break;
        case `${config.discord.prefix}clearlogs`:
            logToLog('<src/modules/DiscordFunctions.js/Case Clearlogs> Passed');
            clearLogFolder();
        break;
        case `${config.discord.prefix}stop`:
            logToLog('<src/modules/DiscordFunctions.js/Case Stop> Passed');
            stopPathfind();
        break;
        case `${config.discord.prefix}exit`:
            process.exit(0);
    };

    if (message.cleanContent.startsWith(`${config.discord.prefix}follow `))
    {
        logToLog('<src/modules/DiscordFunctions.js/If Follow> Passed');
        const usernameToFollow = message.cleanContent.replace(`${config.discord.prefix}follow `, '');
        followPlayer(usernameToFollow);
    }
    else if(message.cleanContent.startsWith(`${config.discord.prefix}goto `))
    {
        logToLog('<src/modules/DiscordFunctions.js/If Goto> Passed');
        const coordsFromMessage = message.cleanContent.split(' ');
        if (!coordsFromMessage[3]) return errEmbed(`Not a valid position`, `- Make sure the command is written like this, ${config.discord.prefix}goto [x] [y] [z], without the brackets`);
        const vecCoords = new Vec3(coordsFromMessage[1], coordsFromMessage[2], coordsFromMessage[3]);
        gotoCoord(vecCoords);
    };
});

module.exports = {
    Discord,
    client,
    commandList
};