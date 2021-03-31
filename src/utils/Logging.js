const fs = require('fs');
const logToFile = require('log-to-file');

function checkLatestLog()
{
    if (!fs.existsSync('logs')) fs.mkdirSync('logs');

    fs.writeFileSync('chat.log', '');
    return new Promise((resolve) =>
    {
        fs.writeFileSync('logs/log0.log', '');
        dir = 'logs/log0.log';
        resolve();
    });
};

function clearLogFolder()
{
    try
    {
        fs.rmdirSync('./logs', { recursive: true });
    }
    catch (err)
    {
        const { errEmbed } = require('../modules/Discord');
        
        logToFile(`<src/utils/Logging.js/ERROR Function clearLogFolder> ERROR: ${err}`, dir);
        errEmbed(err, '- Give the program or NODE permission to write and delete files\n - This error was caused by a dependency, please report it as a bug');
    };
};

function logToLog(content)
{
    logToFile(content, dir);
};

function logToChat(content)
{
    logToFile(content, 'chat.log');
};

function logInv(botInvJSON)
{
    try
    {
        return new Promise((resolve) =>
        {
            fs.writeFileSync('./files/InventoryJSON.json', botInvJSON);
            resolve();
        });
    }
    catch (err)
    {
        const { errEmbed } = require('../modules/Discord');
        
        logToFile(`<src/utils/Logging.js/ERROR Function logInv> ERROR: ${err}`, dir);
        errEmbed(err, '- Give the program or NODE permission to write and delete files\n - This error was caused by a dependency, please report it as a bug');
    };
};

module.exports = {
    checkLatestLog,
    clearLogFolder,
    logToLog,
    logToChat,
    logInv
};