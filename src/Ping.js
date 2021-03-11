const config = require('../config.json');
const { performance } = require('perf_hooks');
const { Discord, client, channel, errEmbed } = require('./Discord');
const { mc, logToFile } = require('../index');

let pingTimerStart;
let pingTimerEnd;
function pingServer()
{
    pingTimerStart = performance.now();
    logToFile('<src/Ping.js> Pinging...', dir);
    if (config.debug) log(`<src/Ping.js> pinging server`);

    mc.ping({
        host: config.server.host,
        port: config.server.port
    }, (err, res) =>
    {
        logToFile('<src/Ping.js> Pinged server', dir);
        if (config.debug) log(`<src/Ping.js> pinged server`);
        if (err) return errorPing(err);
        return returnPing(res);
    });

    async function errorPing(err)
    {
        try
        {
            const pingErrEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle('Bot warning')
            .setThumbnail(client.user.avatarURL())
            .addFields(
                { name: `Warning`, value: `Couldn't ping server`, inline: true }
            );
            
            await channel.send(pingErrEmbed);
            logToFile('<src/DiscordFunctions.js> Sent pingErrEmbed', dir);
        }
        catch (err)
        {
            logToFile(`<src/DiscordFunctions.js> Error ${err}`, dir);
            errEmbed(err, `- Check the IP and PORT\n - If error persists, ask on Discord or report it as a bug`);
        };
    }

    async function returnPing(res)
    {
        try
        {
            pingTimerEnd = performance.now();

            const resEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
            .setColor(config.discord['embed-hex-color'])
            .setTitle('Ping results')
            .setThumbnail(client.user.avatarURL())
            .addFields(
                { name: 'Host', value: config.server.host, inline: true },
                { name: 'Port', value: config.server.port, inline: true },
                { name: 'Version', value: res.version.name, inline: true },
                { name: 'Latency', value: `${res.latency} ms`, inline: true },
                { name: 'Time taken to ping', value: `${Math.round(pingTimerEnd-pingTimerStart)} ms`, inline: true }
            );
            
            await channel.send(resEmbed);
            logToFile('<src/DiscordFunctions.js> Sent resEmbed', dir);
        }
        catch (err)
        {
            logToFile(`<src/DiscordFunctions.js> Error ${err}`, dir);
            errEmbed(err, `- Check the IP and PORT\n - If error persists, ask on Discord or report it as a bug`);
        };
    };
};

module.exports = {
    pingServer
};