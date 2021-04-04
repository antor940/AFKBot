const config = require('../../config.json');

const { Vec3 } = require('vec3');

let startingPosition;
let stopMoving = false;
function moveRandom()
{
    const { bot, goals } = require('./Bot');
    stopMoving = false;
    startingPosition = bot.entity.position;

    randomMove();
    async function randomMove()
    {
        if (stopMoving || !config['anti-kick'].enable) return;
        try
        {
            const goalToGet = randomVecInRange(startingPosition.offset(-config['anti-kick'].radius, 0, -config['anti-kick'].radius), startingPosition.offset(config['anti-kick'].radius, 0, config['anti-kick'].radius));
            const yawToGet = randomPitchYaw().yaw;
            const pitchToGet = randomPitchYaw().pitch;
            bot.pathfinder.setGoal(new goals.GoalXZ(goalToGet.x, goalToGet.z));
            bot.once('goal_reached', async() =>
            {
                await bot.look(yawToGet, pitchToGet, false);
                await equipRandomItem();
                await sleep(config['anti-kick'].interval);
                randomMove();
            });
        }
        catch (err)
        {
            randomMove();
        };
    };

    async function equipRandomItem()
    {
        const randomItem = bot.inventory.items()[Math.floor(Math.random() * bot.inventory.items().length)];
        if (!randomItem) return;
        await bot.equip(randomItem, 'hand');
    };
    
    function randomPitchYaw()
    {
        const pitch = Math.floor(Math.random() * Math.PI - (0.5 * Math.PI));
        const yaw = Math.floor(Math.random() * Math.PI - (0.5 * Math.PI));
        const yawPitchObject = {
            pitch: pitch,
            yaw: yaw
        };
    
        return yawPitchObject;
    };
    
    function randomVecInRange(minVec, maxVec)
    {
        const x = Math.floor(Math.random() * (maxVec.x - minVec.x) + minVec.x);
        const y = Math.floor(Math.random() * (maxVec.y - minVec.y) + minVec.y);
        const z = Math.floor(Math.random() * (maxVec.z - minVec.z) + minVec.z);
        return new Vec3(x, y, z);
    };
};

function sleep(ms)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function stopRandomMove()
{
    stopMoving = true;
};

module.exports = {
    moveRandom,
    stopRandomMove
}