module.exports = {
    saySomething,
    followOwner,
    notifierSend,
    attackMobs,
    embedConstructor,
    antiAFK,
    lookNearEntity
};

//Say something every X seconds
function saySomething(bot, interval, toSay)
{
    setInterval(() => {
        bot.chat(toSay);
    }, interval);
};

//Follow the owner
function followOwner(bot, Discord, channel, toDiscord, announcements, channel, defaultMove, GoalFollow, owner, printError)
{
    try {
        pathfindNow = true;
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalFollow(bot.players[owner].entity, 2), true)

        const pathFindEmbed =  embedConstructor(bot, Discord, announcements, ``, `Pathfind:`, `Target: Owner`);

        toDiscord(channel, pathFindEmbed);
    }
    catch(err)
    {
        printError(`An error occurred when attempting to pathfind:
        Something to check:
        - Make sure you are close to the bot
        - Make sure the bot is not already pathfinding to something
        - Make sure the username in misc.owner in the config.json
          is exactly the same as your username ingame
        The process was not terminated because the error is not critical,
        so you can attempt to resolve the error and
        try again without restart

        ERROR:    
        `, err, false, channel);

        pathfindNow = false;
    };
};

//Function to send a Windows notif
function notifierSend(notifier, chalk, title, message)
{
    notifier.notify({
        title: `${title}`,
        message: (`${message}`),
        icon: 'projectlogo.jpg'
    }, (err) => {
        if (err) {
            console.log(chalk.redBright(` <STATUS> Couldn't send Windows Notification: `)+err)
        } else {
            console.log(chalk.greenBright(` <STATUS> Sent Windows Notification`))
        };
    });
};

//Function to attack mobs
function attackMobs(bot, printError)
{
    //Look at a mob, and attack it when an entity moves
    bot.on('entityMoved', (entity) => {
        if (pathfindNow) return;
        if (entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < 8 && entity.mobType !== 'Armor Stand') {
            const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 && e.mobType !== 'Armor Stand' && e.kind === 'Hostile mobs'
            
            //Get info about the closest mob
            try
            {
                global.mob = bot.nearestEntity(mobFilter);
            }
            catch(err)
            {
                printError(`
                An error occurred while attempting to get info to attack a mob.
                This error is not critical so the process will not be terminated

                ERROR:`, err, false, channel);
            };

            //Return if mob is undefined
            if (!mob) return
            try
            {
                global.pos = mob.position
            }
            catch(err)
            {
                console.log(`
                An error occurred while attempting to get info to attack a mob.
                This error is not critical so the process will not be terminated

                ERROR:`, err, false);
            };

            bot.lookAt(pos, true, () =>
            {
                bot.setControlState('jump', true);

                setTimeout(() => {
                    if (!mob) return;
                    bot.attack(mob);
                }, 500);

                bot.setControlState('jump', false);
            });
        };
    });
};

function embedConstructor(bot, Discord, announcements, message, name, value, name2, value2, name3, value3)
{
    const returnedEmbed = new Discord.MessageEmbed()
    .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
    .setColor(announcements.discordBot.embedHexColor)
    .setDescription(message)
    .setFooter(`${bot.username}`);

    if (name && value)
    {
        returnedEmbed.addFields({ name: name, value: `_${value}_` });
    };

    if (name2 && value2)
    {
        returnedEmbed.addFields({ name: name2, value: `_${value2}_` });
    };

    if (name3 && value3)
    {
        returnedEmbed.addFields({ name: name3, value: `_${value3}_` });
    };

    return returnedEmbed;
};

function antiAFK(bot, timeouts)
{
    //Set the anti afk timeout
    setInterval(() => {
        setTimeout(() => {
            bot.setControlState('jump', false);
        }, 100);
            bot.setControlState('jump', true);
    }, timeouts.antiAFK);
};

//Function to look near an entity
function lookNearEntity(bot)
{
    setInterval(() => {
        if (pathfindNow) return;
        const entity = bot.nearestEntity();
        if (entity !== null) {
            if (entity.type === 'player') {
                bot.lookAt(entity.position.offset(0, 1.6, 0));
            } else if (entity.type === 'mob') {
                bot.lookAt(entity.position);
            };
        };
    }, 50);
};