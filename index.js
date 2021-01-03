var mineflayer = require('mineflayer');
var notifier = require('node-notifier');
var bloodhoundPlugin = require('mineflayer-bloodhound')(mineflayer);
var { pathfinder, Movements } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat');
var { GoalFollow } = require('mineflayer-pathfinder').goals
var botConfig = require('./config.json');
const Discord = require('discord.js');
var dsURL = botConfig.webhook.webhookUrl.split('/');

if (botConfig.webhook.sendMessage === 'true') {
  if (botConfig.webhook.webhookUrl === '') {
    console.log('\n   \x1b[34m<DISCORD> Please specify a Discord WebHook Url\x1b[0m');
    process.exit(1);
  } else if (botConfig.webhook.userIDToPing === '') {
    console.log('\n   \x1b[34m<DISCORD> Please specify a user ID to ping\x1b[0m');
    process.exit(1);
  } else {
    global.hook = new Discord.WebhookClient(dsURL[5], dsURL[6]);
  };
};

startBot()

function startBot() {
  var bot = mineflayer.createBot({
    host: botConfig.host,
    port: parseInt(botConfig.port),
    username: botConfig.username ? botConfig.username : 'AFKBot',
    password: botConfig.password,
    hideErrors: true
  })

  //LOAD PLUGIN, FUNCTIONS
  bot.loadPlugin(pathfinder);

  bot.loadPlugin(autoeat);
  
  var incomingnotification = botConfig.windowsAnnouncements
  var owner = botConfig.owner
  var attackmob = botConfig.attackMobs
  var sendToDS = botConfig.webhook.sendMessage

  bot.on('login', () => {
    bot.loadPlugin(require('mineflayer-dashboard'));
  });

  bot.once('spawn', () => {
    bot.autoEat.options = {
      priority: "foodPoints",
      startAt: botConfig.autoEat.startAt,
      bannedFood: [],
    };

    bot.setControlState('jump', true)

    var playersList = Object.keys(bot.players).join(", ");
    bot.dashboard.log(`\x1b[36m<WORLD> Online players: ${playersList}`);
    if (sendToDS === 'true') {
      bot.dashboard.log(`\x1b[34m<DISCORD> Webhook found`+'\x1b[0m');
      hook.send(`**Online players: ${playersList}**`);
    };
  });


  //LOOKING
  bot.once('login', () => {
    setInterval(() => {
        const entity = bot.nearestEntity();
          if (entity !== null) {
            if (entity.type === 'player') {
            bot.lookAt(entity.position.offset(0, 1.6, 0));
            } else if (entity.type === 'mob') {
              bot.lookAt(entity.position);
            };
          };
        }, 50);
    bot.on('kicked', () => {
      return
    });
  });



  //CHAT
  bot.on('whisper', (username, message, rawMessage) => {
      if (message === 'follow me') {
        if (username === owner) {
          bot.whisper(username, 'On my way');
      }} else if (message === 'stop') {
          null
      } else {
          if (message !== 'follow me' && message !== 'stop') {
            if (username !== bot.username) {
                bot.whisper(username, 'Sorry, I am an AFK Bot');
                bot.dashboard.log('\x1b[32m<STATUS> Correctly whispered that I am a bot','\x1b[0m');
              };
          };
      };
          if (incomingnotification === 'true') {
            if (username !== bot.username) {
              if (username !== 'You') {
                if (message !== 'follow me' && message !== 'stop') {
                  if (message !== 'Sorry, I am an AFK Bot') {
                    notifier.notify({
                      title: 'Whisper Message',
                      message: ('You have a new message'),
                      icon: 'projectlogo.jpg'
                    });
                  };
                };
              };
            };
          };
  });

  bot.on('message', (msg) => {
    if (sendToDS === 'true') {
      hook.send(msg.toString());
    };
  });



  //KICK & ERRORS
  bot.on('kicked', (reason) => {
    reason = JSON.parse(reason);
    bot.dashboard.log('\x1b[32m<STATUS>\x1b[0m \x1b[31mI got kicked.\x1b[0m');
    if (incomingnotification === 'true') {
      notifier.notify({
        title: 'Event Message',
        message: ('I got kicked!'),
        icon: 'projectlogo.jpg'
      });
    };

    if (sendToDS === 'true') {
      hook.send(`<@${botConfig.webhook.userIDToPing}> **I got kicked!**`);
    };

    setTimeout(() => {
      startBot();
    }, 10000);

    if (!reason.extra) return

    if (reason.extra[0].text.includes('banned') === true) {
      bot.dashboard.log('\x1b[32m<STATUS>\x1b[0m \x1b[31mI got banned. Exiting in 10 seconds...');

      if (sendToDS === 'true') {
        hook.send(`<@${botConfig.webhook.userIDToPing}> **I got banned! Exiting in 10 seconds...**`);
      };
      setTimeout(() => {
        process.exit(1);
      }, 10000);
    };
  });
  

  
  //EVENTS
  bot.on('death', () => {
    bot.dashboard.log(`\x1b[32m<STATUS>\x1b[0m \x1b[31mI died`+'\x1b[0m');
    if (incomingnotification === 'true') {
      notifier.notify({
        title: 'Event Message',
        message: ('I died!'),
        icon: 'projectlogo.jpg'
      });
    };

    if (sendToDS === 'true') {
      hook.send(`<@${botConfig.webhook.userIDToPing}> **I died!**`);
    };
  });

  bot.once('spawn', () => {
    bot.dashboard.log(`\x1b[32m<STATUS> Spawned at X: ${Math.floor(bot.entity.position.x)} Y: ${Math.floor(bot.entity.position.y)} Z: ${Math.floor(bot.entity.position.z)}`+'\x1b[0m');
  });

  bot.on('respawn', () => {
    bot.dashboard.log(`\x1b[32m<STATUS> Respawned at X: ${Math.floor(bot.entity.position.x)} Y: ${Math.floor(bot.entity.position.y)} Z: ${Math.floor(bot.entity.position.z)}`+'\x1b[0m');
  });

  bot.on('login', () => {
    bot.dashboard.log('\x1b[32m<STATUS> Logged in'+'\x1b[0m');
  });

  bot.once('health', () => {
    bot.dashboard.log(`\x1b[32m<STATUS> I have ${Math.floor(bot.health)} health.`+'\x1b[0m');

    if (bot.health <= 5)
      bot.dashboard.log(`\x1b[32m<STATUS> \x1b[33mMy remaining health is ${bot.health}`+'\x1b[0m');
  });

  bot.on('health', () => {
    if (bot.food === 20) {
      bot.autoEat.disable();
    } else {
      bot.autoEat.enable();
    };
  });



  //WORLD
  bot.once('time', () => {
    setTimeout(function() {
    bot.dashboard.log(`\x1b[36m<WORLD> \x1b[36mCurrent time: `+Math.abs(bot.time.timeOfDay)+'\x1b[0m');
  }, 1000)});



  //PATHFIND
  bot.once('spawn', () => {
    
    const mcData = require('minecraft-data')(bot.version);

    const defaultMove = new Movements(bot, mcData);
    defaultMove.allowFreeMotion = true

    bot.on('whisper', (username, message) => {
      if (username === bot.username) return

      const target = bot.players[username].entity
      if (username === owner) {
        if (message === 'follow me') {
          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
        } else if (message === 'stop') {
          bot.pathfinder.setGoal(null);
        };
      };
    });
  });



  //AFK
  bot.once('spawn', () => {
    bot.dashboard.log('\x1b[32m<STATUS> Starting anti-AFK-kick sequence'+'\x1b[0m');
    setInterval(() => {
      setTimeout(() => {
       bot.setControlState('jump', false);
      }, 100);
      bot.setControlState('jump', true);
    }, 600000);
  });

  bot.once('spawn', () => {
    if (attackmob === 'true' ) {
      setInterval(() => {
          const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 &&
                e.mobType !== 'Armor Stand'
          const mob = bot.nearestEntity(mobFilter);

          if (!mob) return

          const pos = mob.position
          bot.lookAt(pos, true, () => {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.attack(mob);
        }, 500);
        bot.setControlState('jump', false);
          });
      }, 1000);
  };
  });



  //BLOODHOUND
  bloodhoundPlugin(bot);

  bot.bloodhound.yaw_correlation_enabled = true

  bot.on('onCorrelateAttack', function (attacker,victim,weapon) {
    if (bot.username === victim.username) {
      if (weapon) {
          bot.dashboard.log(`\x1b[32m<STATUS>\x1b[33m Got hurt by ${attacker.displayName || attacker.username} with a/an ${weapon.displayName}\x1b[0m`);
        } else {
          bot.dashboard.log(`\x1b[32m<STATUS>\x1b[33m Got hurt by ${attacker.displayName || attacker.username}\x1b[0m`);
        };
  }});
};
