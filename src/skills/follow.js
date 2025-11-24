// follow.js located in ./skills
const { goals: { GoalFollow } } = require('mineflayer-pathfinder');
const { PLAYER_NAME } = require('../config.js');

async function follow(bot, playerName) {
    // If no playerName is provided, default to the config PLAYER_NAME
    const targetName = playerName || PLAYER_NAME;
    
    const player = bot.players[targetName]?.entity;
    if (!player) {
        return { success: false, error: `Player ${targetName} not found. Are you close enough?` };
    }

    // Set a dynamic goal to follow the entity
    // Range 2 means it will try to stay within 2 blocks
    bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
    
    return { success: true, message: `I am now following ${targetName}. Tell me to 'stop' or give me another command to end following.` };
}

module.exports = { follow };
