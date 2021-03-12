const config = require('../config.json');

function registerBot()
{
    const { logToFile } = require('../index');
    const { bot } = require('./Bot');

    if (config.debug) log(`<src/Login.js> registering bot`);
    logToFile('<src/Login.js> registering bot', dir);
    if (!config['auto-login'].enable) return;
    if (config['auto-login']['repeat-password-on-register']) bot.chat(`/register ${config['auto-login'].password} ${config['auto-login'].password}`);
    else bot.chat(`/register ${config['auto-login'].password}`);
};

function loginBot()
{
    const { logToFile } = require('../index');
    const { bot } = require('./Bot');
    
    if (config.debug) log(`<src/Login.js> logging in bot`);
    logToFile('<src/Login.js> logging in bot', dir);
    if (!config['auto-login'].enable) return;
    bot.chat(`/login ${config['auto-login'].password}`);
};

module.exports = {
    registerBot,
    loginBot
};