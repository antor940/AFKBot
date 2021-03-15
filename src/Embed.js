const config = require('../config.json');

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
            resolve();
        });
    }
    catch(err)
    {
        errEmbed(err, '- This error was caused by one of the modules, if it persists please report it on the Discord server or as a Github Issue');
    };
};

module.exports = {
    fieldEmbed
};