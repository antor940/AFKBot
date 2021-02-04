const config = require('../config.json');
const { Discord, client, channel, errEmbed } = require('./Discord');
const { logToFile, fetch } = require('../index');

logToFile('<src/Viewer.js> Started', dir);
function startViewer()
{
    try
    {
        if (config.debug) log(`<src/Viewer.js> function startviewer`);
        logToFile('<src/BotFunctions.js> startViewer loaded', dir);
        
        const { bot, mineflayerViewer } = require('./Bot');
        mineflayerViewer(bot, { port: port });
    }
    catch (err)
    {
        logToFile(`<src/Viewer.js> ERROR: ${err}`, dir);
        errEmbed(err, '- Port is taken, change the port in the config');
    };
};

let resText;
async function returnViewer()
{
    try
    {
        await fetch.default(`http://localhost:${port}/`).then(res =>
        {
            resText = res.statusText;
        })
        .catch(err =>
        {
            resText = err;
        });

        if (config.debug) log(`<src/Viewer.js> function returnPort`);
        const portEmbed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
        .setColor(config.discord['embed-hex-color'])
        .setTitle('Wolrd Viewer')
        .setThumbnail(client.user.avatarURL())
        .addFields(
            { name: 'URL', value: `http://localhost:${port}/`, inline: true },
            { name: 'Port', value: port, inline: true },
        );

        if (resText === 'OK')
        {
            portEmbed.setDescription(`✅ Viewer Online`);
        }
        else
        {
            portEmbed.setDescription(`❌ Viewer Offline`);
        };

        await channel.send(portEmbed);
        logToFile('<src/Viewer.js> Sent portEmbed', dir);
    }
    catch (err)
    {
        logToFile(`<src/Viewer.js> ERROR: ${err}`, dir);
        errEmbed(err, '- Start the bot before');
    };
};

module.exports = {
    startViewer,
    returnViewer
};