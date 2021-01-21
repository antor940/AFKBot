module.exports = {
    toDiscord,
    toMinecraft,
    whisperMinecraft,
    whisperHandler
};

function toDiscord(channel, content)
{
    //Send content to Discord
    channel.send(content);
};

function toMinecraft(bot, content)
{
    //Send content to Minecraft
    bot.chat(content);
};

function whisperMinecraft(bot, user, content)
{
    //Send whispered content to user
    bot.whisper(user, content);
};

function whisperHandler(bot, username, botOptions, announcements, misc, notifierSend, notifier, chalk)
{
    if (username === bot.username) return;
    if (username !== misc.owner)
    {
        if (botOptions.msgToWhisper) whisperMinecraft(bot, username, botOptions.msgToWhisper);
        console.log(chalk.greenBright(' <STATUS> Whispered that I am a bot'));

        if (!!announcements.windowsAnnouncements) notifierSend(notifier, chalk, 'Whisper Message', 'You have a new message');
    };
};