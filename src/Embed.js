const config = require('../config.json');
const { logToLog } = require('./Logging');

logToLog('<src/Embed.js> Passed');
async function fieldEmbed(embedTitle, fieldArray, embedDesc)
{
    const { Discord, client, channel, errEmbed } = require('./Discord');
    try
    {
        return new Promise(async(resolve) =>
        {
            const fieldEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle(embedTitle)
            .setThumbnail(client.user.avatarURL());
        
            fieldArray.forEach(field =>
            {
                fieldEmbed.addField(field.name, field.value, true);
            });
            if (embedDesc !== '') fieldEmbed.setDescription(embedDesc);
    
            await channel.send(fieldEmbed);
            logToLog('<src/Embed.js/Function fieldEmbed> Passed');
            resolve();
        });
    }
    catch(err)
    {
        errEmbed(err, '- This error was caused by one of the modules, if it persists please report it on the Discord server or as a Github Issue');
    };
};

async function descEmbed(embedTitle, embedDesc)
{
    const { Discord, client, channel, errEmbed } = require('./Discord');
    try
    {
        return new Promise(async(resolve) =>
        {
            const descEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle(embedTitle)
            .setDescription(embedDesc)
            .setThumbnail(client.user.avatarURL());
    
            await channel.send(descEmbed);
            logToLog('<src/Embed.js/Function descEmbed> Passed');
            resolve();
        });
    }
    catch(err)
    {
        errEmbed(err, '- This error was caused by one of the modules, if it persists please report it on the Discord server or as a Github Issue');
    };
};

module.exports = {
    fieldEmbed,
    descEmbed
};