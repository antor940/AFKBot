const config = require('../config.json');
const { performance } = require('perf_hooks');
const { Discord, client, channel, errEmbed } = require('./Discord');
const { mc, logToFile } = require('../index');
const { fieldEmbed } = require('./Embed');

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
            const fieldArr = [
                {
                    name: 'Warning',
                    value: `Couldn't ping server: ${err}`
                }
            ];
            
            await fieldEmbed('Bot warning', fieldArr, '');
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

            const fieldArr = [
                { name: 'Host', value: config.server.host },
                { name: 'Port', value: config.server.port },
                { name: 'Version', value: res.version.name },
                { name: 'Latency', value: `${res.latency} ms` },
                { name: 'Time taken to ping', value: `${Math.round(pingTimerEnd-pingTimerStart)} ms` }
            ];
            
            await fieldEmbed('Ping results', fieldArr, '');
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