process.setMaxListeners(0);
const config = require('../config.json');
const { Discord, client, channel, errEmbed } = require('./Discord');
const { logToFile, fetch } = require('../index');
const { gotoCoord } = require('./Pathfind');

logToFile('<src/Viewer.js> Started', dir);
function startViewer()
{
    try
    {
        if (config.debug) log(`<src/Viewer.js> function startviewer`);
        logToFile('<src/BotFunctions.js> startViewer loaded', dir);
        
        const { bot, mineflayerViewer } = require('./Bot');
        mineflayerViewer(bot, {
            port: port,
            firstPerson: config.viewer['first-person'],
            viewDistance: config.viewer['view-distance']
        });

        bot.on('path_update', (res) =>
        {
            const botPath = [bot.entity.position.offset(0, 0.5, 0)];
            for (const node of res.path)
            {
                botPath.push({ x: node.x, y: node.y + 0.5, z: node.z });
            };

            bot.viewer.drawLine('path', botPath, 0xff0000);
        });

        bot.viewer.on('blockClicked', (block, face, button) =>
        {
            if (button !== 1) return;
            const blockPos = block.position.offset(0, 1, 0);
    
            gotoCoord(blockPos);
        });
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