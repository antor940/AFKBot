const config = require('../../config.json');

const Discord = require('discord.js');

const { logToLog } = require('../utils/Logging');

logToLog('<src/modules/Discord.js> Passed');
const notEnoughCreds = `ERROR: Please specify a Discord Bot Token, a Discord Server ID and a Discord Channel ID`;
const notCorrectIds = `ERROR: server ID, channel ID or Owner Role ID is incorrect, or I cannot access them, please check again\n`;
const neededCreds = !config.discord.token || !config.discord['server-id'] || !config.discord['channel-id'] || !config.discord['owner-role-id'];
if (neededCreds) return console.log(notEnoughCreds);

const client = new Discord.Client();
client.login(config.discord.token)
.catch(error =>
{
    console.log(`Error trying to initialize Discord Bot: ${error} Process will exit.`);
    process.exit(0);
});

client.on('ready', () =>
{
    try
    {
        const channel = client.channels.cache.get(config.discord['channel-id']);
        const guild = client.guilds.cache.get(config.discord['server-id']);
        if (!guild || !channel) return console.log(notCorrectIds);
        const ownerRole = guild.roles.cache.get(config.discord['owner-role-id']);
        if (!ownerRole) return console.log(notCorrectIds);
        if (!guild.members.cache.get(client.user.id).hasPermission('ADMINISTRATOR')) return errEmbed(`Missing permissions`, `- Make sure I have Administrator permissions`);
    
        function errEmbed(err, solutionList)
        {
            const errEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle('An Error ocurred')
            .setThumbnail(client.user.avatarURL())
            .addFields(
                { name: 'Error', value: err, inline: true },
                { name: `Solutions`, value: solutionList }
            );
            
            return channel.send(errEmbed);
        };
    
        module.exports = {
            Discord,
            client,
            channel,
            guild,
            errEmbed
        };
    
        logToLog(`<src/modules/Discord.js/Event on ready> Passed`);
        require('./DiscordFunctions');
    }
    catch (err)
    {
        logToLog(`<src/modules/Discord.js/ERROR Event on ready> ERROR: ${err}`);
        console.log(`ERROR INITIALIZING: ${err}`);
    };
});