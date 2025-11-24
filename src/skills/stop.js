// stop.js located in ./skills

async function stop(bot) {
    // Stop pathfinding
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();
    return { success: true, message: "Stopped." };
}

module.exports = { stop };
