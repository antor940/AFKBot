const config = require('../config.json');
const fs = require('fs');
const logToFile = require('log-to-file');
const fileNumberRegex = /\d/;
let lastNumber;

if (config.debug) log('<src/Logging.js> started');
function checkLatestLog()
{
    fs.writeFileSync('./chat.log', '');
    if (config.debug) log('<src/Logging.js> function checkLatestLog');
    return new Promise((resolve) =>
    {
        fs.readdirSync('./logs').forEach(file =>
        {
            if (file.match(fileNumberRegex))
            {
                lastNumber = file.match(fileNumberRegex);
            };
        });
            
        if (!lastNumber) 
        {
            fs.writeFileSync('./logs/log0.log', '');
            resolve();
        }
        else
        {
            dir = `./logs/log${parseInt(lastNumber[0]) + 1}.log`;
            resolve();
        };
    });
};

function clearLogFolder()
{
    if (config.debug) log('<src/Logging.js> function clearLogFolder');
    try
    {
        fs.rmdirSync('./logs', { recursive: true });
    }
    catch (err)
    {
        const { errEmbed } = require('./Discord');
        
        logToFile(`<src/Logging.js> Error: ${err}`, dir);
        errEmbed(err, '- Give the program or NODE permission to write and delete files\n - This error was caused by a dependency, please report it as a bug');
    };
};

module.exports = {
    checkLatestLog,
    clearLogFolder
};