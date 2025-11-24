// goTo.js located in ./skills

const { goals: { GoalBlock } } = require('mineflayer-pathfinder');

async function goTo(bot, target) {
    try {
        await bot.pathfinder.goto(new GoalBlock(target.x, target.y, target.z));
        return { success: true };
    } catch (err) {
        console.log(`INFO: goTo failed: ${err.message}`);
        return { success: false, error: err.message };
    }
}

module.exports = {
    goTo
};
