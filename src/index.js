console.clear()
const config = require('../config.json')

global.dir = './logs/log0.log'
global.port = config.viewer.port

const Discord = require('discord.js')
const mc = require('minecraft-protocol')
const mineflayer = require('mineflayer')
const { performance } = require('perf_hooks')
const logToFile = require('log-to-file')
const fetch = require('node-fetch')

const { checkLatestLog, logToLog } = require('./utils/Logging')
const { checkUpdate } = require('./utils/Update')

checkLatestLog().then(async () => {
  module.exports = {
    logToFile,
    Discord,
    mc,
    mineflayer,
    performance,
    fetch
  }

  await checkUpdate()
  logToLog('<src/index.js/Promise checkLatestLog> Passed')
  require('./modules/Discord')
})
