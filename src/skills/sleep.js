// src/skills/sleep.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function goToSleep(bot) {
    // Find bed
    const bed = bot.findBlock({
        matching: block => block.name.includes('_bed'),
        maxDistance: 32
    });

    if (!bed) return { success: false, message: "No bed found nearby." };

    if (bot.isSleeping) return { success: true, message: "Already sleeping." };

    try {
        await bot.pathfinder.goto(new GoalNear(bed.position.x, bed.position.y, bed.position.z, 1));
        await bot.sleep(bed);
        return { success: true, message: "I am now sleeping." };
    } catch (err) {
        return { success: false, error: `Failed to sleep: ${err.message}` };
    }
}

module.exports = { goToSleep };
