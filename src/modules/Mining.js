const { stopRandomMove, moveRandom } = require('./AntiKick')
const { errEmbed } = require('./Discord')

const { logToLog } = require('../utils/Logging')

let stopMining
logToLog('<src/modules/Mining.js> Passed')
async function mineGenerator (vec3ofBlock) {
  logToLog('<src/modules/Mining.js/Function mineGenerator> Passed')
  try {
    stopRandomMove()
    stopMining = false
    const { bot } = require('./Bot')
    if (bot.entity.position.distanceTo(vec3ofBlock) > 10) return errEmbed('Can\'t reach block', '- Block is probably too far to break, check it in the config.json')

    mineBlock()
    async function mineBlock () {
      if (stopMining) return
      if (bot.blockAt(vec3ofBlock).name === 'air') {
        await sleep(1000)
        return mineBlock()
      };

      const toolToEquip = bot.pathfinder.bestHarvestTool(bot.blockAt(vec3ofBlock))
      if (toolToEquip) await bot.equip(toolToEquip, 'hand')
      await bot.dig(bot.blockAt(vec3ofBlock), false)
      mineBlock()
    };
  } catch (err) {
    logToLog(`<src/modules/Mining.js/ERROR Function mineGenerator> ERROR: ${err}`)
  };
};

function stopGenerator () {
  logToLog('<src/modules/Mining.js/Function stopGenerator> Passed')
  moveRandom()
  stopMining = true
};

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
};

module.exports = {
  mineGenerator,
  stopGenerator
}
