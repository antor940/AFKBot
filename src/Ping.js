const config = require('../config.json');
const { mc, logToFile } = require('../index');

function pingServer()
{
    logToFile('<src/Ping.js> Pinging...', dir);
    if (config.debug) log(`<src/Ping.js> pinging server`);
    return new Promise((resolve, reject) =>
    {
        mc.ping({
            host: config.server.host,
            port: config.server.port
        }, (err, res) =>
        {
            logToFile('<src/Ping.js> Pinged server', dir);
            if (config.debug) log(`<src/Ping.js> pinged server`);
            if (err) return reject(err);
            resolve(res);
        });
    });
};

module.exports = {
    pingServer
};