const config = require('../../config.json');

const { logToLog } = require('../utils/Logging');

logToLog('<src/modules/Login.js> Passed');
function registerBot()
{
    const { bot } = require('./Bot');

    if (!config['auto-login'].enable) return;
    if (config['auto-login']['repeat-password-on-register']) bot.chat(`/register ${config['auto-login'].password} ${config['auto-login'].password}`);
    else bot.chat(`/register ${config['auto-login'].password}`);
    logToLog('<src/modules/Login.js/Function registerBot> Passed');
};

function loginBot()
{
    const { bot } = require('./Bot');
    
    if (!config['auto-login'].enable) return;
    bot.chat(`/login ${config['auto-login'].password}`);
    logToLog('<src/modules/Login.js/Function loginBot> Passed');
};

module.exports = {
    registerBot,
    loginBot
};