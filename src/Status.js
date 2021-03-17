const config = require('../config.json');
const { Discord, client, errEmbed } = require('./Discord');
const { logToFile } = require('../index');

logToFile('<src/Status.js> Started', dir);
if (config.debug) log('<src/Status.js> started');
function getStatus()
{
    logToFile('<src/Status.js> Started getStatus', dir);
    return new Promise((resolve) =>
    {
        try
        {
            const { bot } = require('./Bot');

            const statusEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle('Status results')
            .setThumbnail(client.user.avatarURL())
            .addFields(
                { name: 'Username', value: bot.username, inline: true },
                { name: 'Host', value: config.server.host, inline: true },
                { name: 'Port', value: config.server.port, inline: true },
                { name: 'Version', value: bot.version, inline: true },
                { name: 'Position', value: `x: ${Math.floor(bot.entity.position.x)} y: ${Math.floor(bot.entity.position.y)} z:  ${Math.floor(bot.entity.position.z)}`, inline: true },
                { name: 'Looking', value: `Yaw: ${Math.floor(bot.entity.yaw)} Pitch: ${Math.floor(bot.entity.yaw)}`, inline: true }
            );
            
            resolve(statusEmbed);
        }
        catch (err)
        {
            logToFile(`<src/Status.js> Error: ${err}`, dir);
            errEmbed(err, `- Make sure the bot is started`);
        };
    });
};

module.exports = {
    getStatus
};