const config = require('../config.json');
const { logToFile } = require('../index');

async function fieldEmbed(embedTitle, fieldArray, embedDesc)
{
    if (config.debug) log('<src/Embed.js> fieldEmbed executed');
    logToFile('<src/Embed.js> fieldEmbed executed', dir);
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
            if (config.debug) log('<src/Embed.js> fieldEmbed sent');
            logToFile('<src/Embed.js> fieldEmbed sent', dir);
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
    if (config.debug) log('<src/Embed.js> descEmbed executed');
    logToFile('<src/Embed.js> fieldEmbed executed', dir);
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
            if (config.debug) log('<src/Embed.js> descEmbed sent');
            logToFile('<src/Embed.js> descEmbed sent', dir);
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