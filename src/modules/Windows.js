const { notify } = require('node-notifier')

const { errEmbed } = require('./Discord')

const { logToLog } = require('../utils/Logging')

logToLog('<src/modules/Windows.js> Passed')
function sendNotification (title, message) {
  return new Promise((resolve) => {
    notify({
      title: title,
      message: message,
      closeLabel: 'Close',
      icon: '../files/logo.png'
    }, (err) => {
      if (err) {
        logToLog(`<src/modules/Windows.js/ERROR Function sendNotification> ERROR: ${err}`)
        errEmbed(err, '- This is an error caused by a dependency, if it\'s persistent, please report it as a bug\n - Try reinstalling the dependencies\n - Enable the notifications for this program')
      };
    })

    logToLog('<src/modules/Windows.js/Function sendNotification> Passed')
    setTimeout(() => {
      resolve()
    }, 1000)
  })
};

module.exports = {
  sendNotification
}
