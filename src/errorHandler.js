module.exports = {
    printError
};

//Error handling
function printError(content, err, exit, channel)
{
    console.log(`\n${content}${err}\n`);

    channel.send(`<ERROR> Check the console`);

    if (exit) process.exit();
};