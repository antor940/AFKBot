const config = require('../../config.json');

const fetch = require('node-fetch');

const { logToLog } = require('./Logging');
const thisVer = 24;

logToLog('<src/utils/Update.js> Passed');
function checkUpdate()
{
    if (!config['check-updates']) return;
    return new Promise((resolve) =>
    {
        try
        {
            fetch('https://api.github.com/repos/DrMoraschi/AFKBot/releases')
            .then(res => res.json())
            .then(json =>
            {
                if (parseInt(json[0].tag_name.replace('v', '').replace('.', '')) > thisVer) console.log(`New ${json[0].tag_name.replace('v', '')} version is available, you can download it at: https://github.com/DrMoraschi/AFKBot/releases/latest`);
                resolve();
                logToLog(`<src/utils/Update.js/Function checkUpdate> Passed`);
            });
        }
        catch(err)
        {
            logToLog(`<src/utils/Update.js/ERROR Function checkUpdate> ERROR: ${err}`);
            console.log(`ERROR INITIALIZING: ${err}`);
        };
    });
};

module.exports = {
    checkUpdate
};
