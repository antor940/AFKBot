const fetch = require('node-fetch');
const config = require('../config.json');
const thisVer = 23;

function checkUpdate()
{
    if (!config['check-updates']) return;
    const { logToFile } = require('../index');
    return new Promise((resolve) =>
    {
        try
        {
            if (config.debug) log(`<src/Update.js> checking version`);
            logToFile(`<src/Update.js> checking version`, dir);
            fetch('https://api.github.com/repos/DrMoraschi/AFKBot/releases')
            .then(res => res.json())
            .then(json =>
            {
                if (parseInt(json[0].tag_name.replace('v', '').replace('.', '')) > thisVer) console.log(`New ${json[0].tag_name.replace('v', '')} version is available, you can download it at: https://github.com/DrMoraschi/AFKBot/releases/latest`);
                resolve();
            });
        }
        catch(err)
        {
            logToFile(`<src/Update.js> ERROR INITIALIZING: ${err}`, dir);
            console.log(`ERROR INITIALIZING: ${err}`);
        };
    });
};

module.exports = {
    checkUpdate
};
