// goNear.js located in ./skills

const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function goNear(bot, target, range=2) {
    try {
        await bot.pathfinder.goto(new GoalNear(target.x, target.y, target.z, range));
        return { success: true };
    } catch (err) {
        console.log(`INFO: goNear failed: ${err.message}`);
        return { success: false, error: err.message };
    }
}

module.exports = {
    goNear
};
