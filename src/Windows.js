const config = require('../config.json');
const { notify } = require('node-notifier');
const { errEmbed } = require('./Discord');
const { logToFile } = require('../index');

if (config.debug) log('<src/Windows.js> started');
logToFile('<src/Windows.js> Started', dir);
function sendNotification(title, message)
{
    return new Promise((resolve) =>
    {
        if (config.debug) log(`<src/Windows.js> load notifier`);
        logToFile('<src/Windows.js> sendNotification loaded', dir);
        notify({
            title: title,
            message: message,
            closeLabel: 'Close',
            icon: '../files/logo.png'
        }, (err, res) =>
        {
            if (err)
            {
                logToFile(`<src/Windows.js> Error: ${err}`, dir);
                errEmbed(err, `- This is an error caused by a dependency, if it's persistent, please report it as a bug\n - Try reinstalling the dependencies\n - Enable the notifications for this program`);
            }
            else
            {
                logToFile(`<src/Windows.js> Notification sent and dismissed. Status: ${res}`, dir);
            };
        });

        setTimeout(() => {
            resolve();
        }, 1000);
    });
};

module.exports = {
    sendNotification
};