const config = require('../config.json');
const { logToLog } = require('./Logging');

logToLog('<src/Login.js> Passed');
function registerBot()
{
    const { bot } = require('./Bot');

    if (!config['auto-login'].enable) return;
    if (config['auto-login']['repeat-password-on-register']) bot.chat(`/register ${config['auto-login'].password} ${config['auto-login'].password}`);
    else bot.chat(`/register ${config['auto-login'].password}`);
    logToLog('<src/Login.js/Function registerBot> Passed');
};

function loginBot()
{
    const { bot } = require('./Bot');
    
    if (!config['auto-login'].enable) return;
    bot.chat(`/login ${config['auto-login'].password}`);
    logToLog('<src/Login.js/Function loginBot> logging in bot');
};

module.exports = {
    registerBot,
    loginBot
};