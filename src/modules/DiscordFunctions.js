const config = require('../../config.json')
const errors = require('../data/errors.json')

const { Vec3 } = require('vec3')

const { startBot, stopBot } = require('./Bot')
const { followPlayer, gotoCoord, stopPathfind } = require('./Pathfind')
const { Discord, client, errEmbed, channel, guild } = require('./Discord')
const { autoFish, stopFishing } = require('./Fishing')
const { listInventory, rawInventory, emptyInventory } = require('./Inventory')
const { returnViewer } = require('./Viewer')
const { getStatus } = require('./Status')
const { mineGenerator, stopGenerator } = require('./Mining')

const { clearLogFolder, logToLog } = require('../utils/Logging')
const { pingServer } = require('../utils/Ping')
const { fieldEmbed } = require('../utils/Embed')

console.log(`<DISCORD> Logged in: ${client.user.tag}`)
if (config.discord['bot-rpc'].enable) client.user.setActivity(config.discord['bot-rpc'].text)

const commandList = [
    `${config.discord.prefix}help`,
    `${config.discord.prefix}ping`,
    `${config.discord.prefix}start`,
    `${config.discord.prefix}follow`,
    `${config.discord.prefix}stop`,
    `${config.discord.prefix}fish`,
    `${config.discord.prefix}stopfish`,
    `${config.discord.prefix}goto`,
    `${config.discord.prefix}list`,
    `${config.discord.prefix}empty`,
    `${config.discord.prefix}generator`,
    `${config.discord.prefix}stopgen`,
    `${config.discord.prefix}say`,
    `${config.discord.prefix}status`,
    `${config.discord.prefix}clearlogs`,
    `${config.discord.prefix}viewer`,
    `${config.discord.prefix}exit`,
    `${config.discord.prefix}leave`,
    `${config.discord.prefix}rawinv`
]

const helpField = [
  { name: 'Link', value: '[Commands](https://drmoraschi.github.io/AFKBot/files/page/)' }
]

fieldEmbed('Commands', helpField, 'This link will take you to the commands page')
logToLog('<src/modules/DiscordFunctions.js> Passed')

if (config['auto-start']) {
  startBot()
    .catch(err => {
      logToLog(`<src/modules/DiscordFunctions.js/ERROR Case Start> ERROR: ${err}`)
      errEmbed(err, '- Check credentials, IP, Port, and version\n - If error persists, ask on Discord or report it as a bug')
    })
};

client.on('message', async (message) => {
  if (message.author.bot || message.channel.id !== config.discord['channel-id']) return
  if (!guild.members.cache.get(message.author.id).roles.cache.has(config.discord['role-to-reply-to'])) return
  switch (message.cleanContent) {
    case `${config.discord.prefix}help`:
      logToLog('<src/modules/DiscordFunctions.js/Case Help> Passed')
      fieldEmbed('Commands', helpField, 'This link will take you to the commands page')
      break
    case `${config.discord.prefix}ping`:
      logToLog('<src/modules/DiscordFunctions.js/Case Ping> Passed')
      pingServer()
      break
    case `${config.discord.prefix}start`:
      logToLog('<src/modules/DiscordFunctions.js/Case Start> Passed')
      startBot()
        .catch(err => {
          logToLog(`<src/modules/DiscordFunctions.js/ERROR Case Start> ERROR: ${err}`)
          errEmbed(err, '- Check credentials, IP, Port, and version\n - If error persists, ask on Discord or report it as a bug')
        })
      break
    case `${config.discord.prefix}status`:
      logToLog('<src/modules/DiscordFunctions.js/Case Status> Passed')
      getStatus()
      break
    case `${config.discord.prefix}fish`:
      logToLog('<src/modules/DiscordFunctions.js/Case Fish> Passed')
      autoFish()
      break
    case `${config.discord.prefix}stopfish`:
      logToLog('<src/modules/DiscordFunctions.js/Case Stopfish> Passed')
      stopFishing()
      break
    case `${config.discord.prefix}list`:
      logToLog('<src/modules/DiscordFunctions.js/Case List> Passed')
      listInventory()
      break
    case `${config.discord.prefix}rawinv`:
      logToLog('<src/modules/DiscordFunctions.js/Case Rawinv> Passed')
      rawInventory()
      break
    case `${config.discord.prefix}empty`:
      logToLog('<src/modules/DiscordFunctions.js/Case Empty> Passed')
      emptyInventory()
      break
    case `${config.discord.prefix}viewer`:
      logToLog('<src/modules/DiscordFunctions.js/Case Viewer> Passed')
      returnViewer()
      break
    case `${config.discord.prefix}stopgen`:
      logToLog('<src/modules/DiscordFunctions.js/Case Stopgen> Passed')
      stopGenerator()
      break
    case `${config.discord.prefix}clearlogs`:
      logToLog('<src/modules/DiscordFunctions.js/Case Clearlogs> Passed')
      clearLogFolder()
      break
    case `${config.discord.prefix}stop`:
      logToLog('<src/modules/DiscordFunctions.js/Case Stop> Passed')
      stopPathfind()
      break
    case `${config.discord.prefix}leave`:
      stopBot()
      break
    case `${config.discord.prefix}exit`:
      process.exit(0)
  };

  if (message.cleanContent.startsWith(`${config.discord.prefix}follow `)) {
    logToLog('<src/modules/DiscordFunctions.js/If Follow> Passed')
    const usernameToFollow = message.cleanContent.replace(`${config.discord.prefix}follow `, '')
    followPlayer(usernameToFollow)
  } else if (message.cleanContent.startsWith(`${config.discord.prefix}goto `)) {
    logToLog('<src/modules/DiscordFunctions.js/If Goto> Passed')
    const coordsFromMessage = message.cleanContent.split(' ')
    if (!coordsFromMessage[3]) return errEmbed('Not a valid position', `- Make sure the command is written like this, ${config.discord.prefix}goto [x] [y] [z], without the brackets`)
    const vecCoords = new Vec3(coordsFromMessage[1], coordsFromMessage[2], coordsFromMessage[3])
    gotoCoord(vecCoords)
  } else if (message.cleanContent.startsWith(`${config.discord.prefix}generator `)) {
    logToLog('<src/modules/DiscordFunctions.js/If Generator> Passed')
    const coordsFromMessage = message.cleanContent.split(' ')
    if (!coordsFromMessage[3]) return errEmbed('Not a valid position', `- Make sure the command is written like this, ${config.discord.prefix}generator [x] [y] [z], without the brackets`)
    const vecCoords = new Vec3(coordsFromMessage[1], coordsFromMessage[2], coordsFromMessage[3])
    mineGenerator(vecCoords)
  };
})

module.exports = {
  Discord,
  client,
  commandList
}
