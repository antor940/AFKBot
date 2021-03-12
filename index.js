console.clear();
const config = require('./config.json');
global.log = console.log;
global.dir = './logs/log0.log';
global.port = config.viewer.port;

const Discord = require('discord.js');
const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');
const { performance } = require('perf_hooks');
const logToFile = require('log-to-file');
const fetch = require('node-fetch');
const { checkLatestLog } = require('./src/Logging');
const { checkUpdate } = require('./src/Update');

checkLatestLog().then(async() =>
{
    if (config.debug) log(`<index.js> starting up`);
    
    module.exports = {
        logToFile,
        Discord,
        mc,
        mineflayer,
        performance,
        fetch
    };
    
    await checkUpdate();
    logToFile('<index.js> Initializing Discord', dir);
    require('./src/Discord');
});