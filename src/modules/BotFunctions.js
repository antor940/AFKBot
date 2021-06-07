function startBotFunctions () {
  const config = require('../../config.json')

  const { bot, mcData, startBot } = require('./Bot')
  const { startViewer } = require('./Viewer')
  const { client, channel, guild, errEmbed } = require('./Discord')
  const { commandList } = require('./DiscordFunctions')
  const { sendNotification } = require('./Windows')
  const { autoEat, enablePlugin, disablePlugin } = require('./Eat')
  const { moveRandom } = require('./AntiKick')

  const { fieldEmbed } = require('../utils/Embed')
  const { logToLog, logToChat } = require('../utils/Logging')

  // Minecraft
  logToLog('<src/modules/BotFunctions.js/Function startBotFunctions> Passed')
  if (config['notify-on-user'].enable) notifyUsers()
  if (config.whispers['enable-answer']) autoWhisper()
  if (config.logs['log-chat-to-file']) logChat()
  if (config['auto-eat'].enable) autoEat()
  if (config['misc-options']['look-entities']) autoLook()
  if (config.pvp.enable) autoPvP()
  if (config['anti-kick'].enable) moveRandom()
  if (config['message-on-interval'].enable) intervalMessage()
  if (config['message-on-spawn'].enable) spawnMessage()
  if (config.viewer.enable) startViewer()

  bot.on('error', (err) => {
    errEmbed(err, '- This was caused by something that interacted with the bot\n - If it persists, please report in on Discord or create an issue')
  })

  bot._client.on('resource_pack_send', () => {
    logToLog('<src/modules/BotFunctions.js/Event on resource_pack_send> Passed')
    bot._client.write('resource_pack_receive',
      {
        result: 3
      })

    bot._client.write('resource_pack_receive',
      {
        result: 0
      })
  })

  bot.on('message', (message) => {
    if (config.logs['log-chat-to-console']) console.log(`<CHAT> ${message.toAnsi()}`)

    if (!config['misc-options']['send-chat-to-ds']) return
    channel.send(`<CHAT> ${message.toString()}`)
  })

  let pauseOnSent = false
  let onConnectDont = true
  bot.once('health', async () => {
    const embedArr = [
      {
        name: 'Time',
        value: bot.time.timeOfDay
      },
      {
        name: 'Spawn position',
        value: `x: ${Math.round(bot.entity.position.x)} y: ${Math.round(bot.entity.position.y)} z: ${Math.round(bot.entity.position.z)}`
      },
      {
        name: 'Health',
        value: Math.floor(bot.health)
      }
    ]

    await fieldEmbed('Bot started', embedArr, '')
    logToLog('<src/modules/BotFunctions.js/Event once health> Passed')

    setTimeout(() => {
      onConnectDont = false
    }, 10000)
  })

  bot.on('health', async () => {
    if (bot.health < config['low-health']['health-points'] && bot.health > 0) {
      if (pauseOnSent) return
      if (!config['low-health']['warn-on-low-health']) return
      const embedArr = [
        {
          name: 'Health',
          value: `Below or equal to ${Math.floor(bot.health)}, bot will disconnect if the setting is enabled in the config`
        }
      ]

      await fieldEmbed('Bot warning', embedArr, '')
      logToLog('<src/modules/BotFunctions.js/Event on health> Passed')
      pauseOnSent = true

      if (config['low-health']['disconnect-on-low-health'] && !onConnectDont) process.exit(1)

      setTimeout(() => {
        pauseOnSent = false
      }, 10000)
    };
  })

  bot.on('kicked', async (reason) => {
    if (reason.match(/(banned)/ig)) {
      console.log(`Banned from the server: ${reason}`)
      const embedArr = [
        {
          name: 'Warning',
          value: `Banned from the server: ${reason}`
        }
      ]

      await fieldEmbed('Bot warning', embedArr, '')
      logToLog('<src/modules/BotFunctions.js/Event on kicked> Passed')
      if (config['windows-notifications']['on-banned']) await sendNotification('Banned', reason)
      process.exit(1)
    } else {
      console.log(`Kicked from the server: ${reason}`)
      const embedArr = [
        {
          name: 'Warning',
          value: `Kicked from the server, reconnecting in ${config.timeouts['on-kicked'] / 1000} seconds. Reason: ${reason}`
        }
      ]

      await fieldEmbed('Bot warning', embedArr, '')
      logToLog('<src/modules/BotFunctions.js/Event on kicked> Passed')
      if (config['windows-notifications']['on-kicked']) sendNotification('Kicked', reason)

      if (!config['misc-options']['reconnect-on-kick']) return
      setTimeout(() => {
        startBot()
      }, config.timeouts['on-kicked'])
    };
  })

  bot.inventory.on('windowUpdate', () => {
    const foodArray = bot.inventory.items().filter(itemToFind => mcData.foodsArray.find(item => item.name === itemToFind.name))
    if (!foodArray.length) {
      disablePlugin()
    } else if (foodArray.length) {
      enablePlugin()
    };
  })

  let AttackerItem
  let AttackerUsername
  let EntityHurt
  bot.on('death', async () => {
    await bot.pathfinder.setGoal(null)
    if (config['message-on-death'].enable) {
      setTimeout(() => {
        bot.chat(config['message-on-death'].message)
      }, config['message-on-death'].delay)
    };

    const embedArr = [
      { name: 'Weapon', value: AttackerItem || 'Coudln\'t find out' },
      { name: 'Attacker', value: AttackerUsername || 'Coudln\'t find out' }
    ]

    await fieldEmbed('Bot warning', embedArr, 'Died or killed')
    AttackerItem = null
    AttackerUsername = null
    logToLog('<src/modules/BotFunctions.js/Event on death> Passed')
    if (config['windows-notifications']['on-death']) sendNotification('Warning', 'Died or killed')
  })

  bot.on('entityHurt', (entityHurt) => {
    if (entityHurt.username !== bot.username) return
    EntityHurt = entityHurt
    checkSwingArm()

    function checkSwingArm () {
      bot.once('entitySwingArm', (entitySwingArm) => {
        if (entitySwingArm.type !== 'player' || EntityHurt.username !== bot.username) return
        AttackerItem = entitySwingArm.heldItem ? entitySwingArm.heldItem.name : 'hand'
        AttackerUsername = entitySwingArm.username
      })
    };
  })

  function spawnMessage () {
    setTimeout(() => {
      bot.chat(config['message-on-spawn'].message)
    }, config['message-on-spawn'].delay)
  };

  function notifyUsers () {
    logToLog('<src/modules/BotFunctions.js/Function notifyUsers> Passed')
    bot.on('playerJoined', async (player) => {
      if (config['notify-on-user'].list.includes(player.username)) {
        const embedArr = [
          {
            name: 'Player that joined',
            value: player.username
          }
        ]

        await fieldEmbed('Specified player joined', embedArr, 'A player specified in the config has joined')
      };
    })
  };

  function autoLook () {
    logToLog('<src/modules/BotFunctions.js/Function autoLook> Passed')
    bot.on('entityMoved', (entity) => {
      if (bot.pathfinder.isMoving()) return
      if (entity.type !== 'player' || bot.entity.position.distanceTo(entity.position) > 5) return
      bot.lookAt(entity.position.offset(0, 1.6, 0))
    })
  };

  function autoPvP () {
    logToLog('<src/modules/BotFunctions.js/Function autoPvP> Passed')
    bot.on('entityMoved', (entity) => {
      if (!config.pvp.enable || bot.entity.position.distanceTo(entity.position) > 5 || bot.pathfinder.isMoving()) return
      if (!config.pvp['attack-endermans'] && entity.mobType === 'Enderman') return
      if (config.pvp['attack-players']) {
        if (entity.type === 'player') {
          bot.pvp.attack(entity)
        };
      };

      if (entity.kind === 'Hostile mobs') {
        bot.pvp.attack(entity)
      };
    })
  };

  function intervalMessage () {
    try {
      logToLog('<src/modules/BotFunctions.js/Function intervalMessage> Passed')
      setInterval(() => {
        bot.chat(config['message-on-interval'].message)
      }, config['message-on-interval'].interval)
    } catch (err) {
      logToLog(`<src/modules/BotFunctions.js/ERROR Function intervalMessage> ERROR: ${err}`)
      errEmbed(err, '- Check the config for the message-interval')
    };
  };

  function logChat () {
    bot.on('message', (message) => {
      logToChat(message.toString())
    })
  };

  function autoWhisper () {
    bot.on('whisper', (username) => {
      setTimeout(() => {
        bot.whisper(username, config.whispers['message-to-answer'])
      }, config.whispers['timeout-on-whisper'])
    })
  };

  // Discord
  client.on('message', (message) => {
    if (message.author.bot || message.channel.id !== config.discord['channel-id']) return
    if (!guild.members.cache.get(message.author.id).roles.cache.has(config.discord['role-to-reply-to'])) return
    if (message.cleanContent.startsWith(`${config.discord.prefix}say `)) {
      if (config.discord['send-chat-to-minecraft']) return
      const msgToSay = message.cleanContent.replace(`${config.discord.prefix}say `, '')
      bot.chat(msgToSay)
    };

    if (message.cleanContent.startsWith(`${config.discord.prefix}follow`) || message.cleanContent.startsWith(`${config.discord.prefix}goto`) || message.cleanContent.startsWith(`${config.discord.prefix}generator`)) return
    if (!config.discord['send-chat-to-minecraft'] || commandList.indexOf(message.cleanContent) >= 0 || message.author.bot) return
    bot.chat(message.cleanContent)
  })
};

module.exports = {
  startBotFunctions
}
