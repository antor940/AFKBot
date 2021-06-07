const config = require('../../config.json')
const errors = require('../data/errors.json')

const { performance } = require('perf_hooks')

const { mc } = require('../index')
const { errEmbed } = require('../modules/Discord')

const { fieldEmbed } = require('./Embed')
const { logToLog } = require('./Logging')

let pingTimerStart
let pingTimerEnd
logToLog('<src/utils/Ping.js> Passed')
function pingServer () {
  pingTimerStart = performance.now()

  mc.ping({
    host: config.server.host,
    port: config.server.port
  }, (err, res) => {
    logToLog('<src/utils/Ping.js/Function pingServer> Passed')
    if (err) return errorPing()
    return returnPing(res)
  })

  async function errorPing () {
    try {
      await errEmbed(`Couldn't ping: ${errors.server['Error: connect ECONNREFUSED']}`, '- Check IP and Port')
      logToLog('<src/utils/Ping.js/Function errorPing> Passed')
    } catch (err) {
      logToLog(`<src/utils/Ping.js/ERROR Function errorPing> ERROR: ${err}`)
      errEmbed(err, '- Check the IP and PORT\n - If error persists, ask on Discord or report it as a bug')
    };
  }

  async function returnPing (res) {
    try {
      pingTimerEnd = performance.now()

      const fieldArr = [
        { name: 'Host', value: config.server.host },
        { name: 'Port', value: config.server.port },
        { name: 'Version', value: res.version.name },
        { name: 'Latency', value: `${res.latency} ms` },
        { name: 'Time taken to ping', value: `${Math.round(pingTimerEnd - pingTimerStart)} ms` }
      ]

      await fieldEmbed('Ping results', fieldArr, '')
      logToLog('<src/utils/DiscordFunctions.js/Function returnPing> Passed')
    } catch (err) {
      logToLog(`<src/utils/DiscordFunctions.js/ERROR Function returnPing> ERROR: ${err}`)
      errEmbed(err, '- Check the IP and Port\n - If error persists, ask on Discord or report it as a bug')
    };
  };
};

module.exports = {
  pingServer
}
