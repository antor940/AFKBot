const config = require('../../config.json')

const portfinder = require('portfinder')

const { fetch } = require('../index')
const { Discord, client, channel, errEmbed } = require('./Discord')
const { gotoCoord } = require('./Pathfind')

const { logToLog } = require('../utils/Logging')
let getPort

logToLog('<src/modules/Viewer.js> Passed')
async function startViewer () {
  try {
    const { bot, mineflayerViewer } = require('./Bot')
    getPort = await portfinder.getPortPromise()

    mineflayerViewer(bot, {
      port: getPort,
      firstPerson: config.viewer['first-person'],
      viewDistance: config.viewer['view-distance']
    })

    bot.on('path_update', (res) => {
      const botPath = [bot.entity.position.offset(0, 0.5, 0)]
      for (const node of res.path) {
        botPath.push({ x: node.x, y: node.y + 0.5, z: node.z })
      };

      bot.viewer.drawLine('path', botPath, 0xff0000)
    })

    bot.viewer.on('blockClicked', (block, face, button) => {
      if (button !== 1) return
      const blockPos = block.position.offset(0, 1, 0)

      gotoCoord(blockPos)
    })
    logToLog('<src/modules/BotFunctions.js/Function startViewer> Passed')
  } catch (err) {
    logToLog(`<src/modules/Viewer.js/ERROR Function startViewer> ERROR: ${err}`)
    errEmbed(err, '- Port is taken, change the port in the config')
  };
};

let resText
async function returnViewer () {
  try {
    await fetch.default(`http://localhost:${getPort}/`).then(res => {
      resText = res.statusText
    })
      .catch(err => {
        resText = err
      })

    const portEmbed = new Discord.MessageEmbed()
      .setAuthor(client.user.username, '', 'https://github.com/DrMoraschi/AFKBot')
      .setColor(config.discord['embed-hex-color'])
      .setTitle('World Viewer')
      .setThumbnail(client.user.avatarURL())

    if (resText === 'OK') {
      portEmbed.addFields(
        { name: 'URL', value: `http://localhost:${getPort}/`, inline: true },
        { name: 'Port', value: getPort, inline: true }
      )
      portEmbed.setDescription('✅ Viewer Online')
    } else {
      portEmbed.setDescription('❌ Viewer Offline')
    };

    await channel.send(portEmbed)
    logToLog('<src/modules/Viewer.js/Function returnViewer> Passed')
  } catch (err) {
    logToLog(`<src/modules/Viewer.js/ERROR Function returnViewer> ERROR: ${err}`)
    errEmbed(err, '- Start the bot before')
  };
};

module.exports = {
  startViewer,
  returnViewer
}
