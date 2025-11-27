// src/skills/follow.js
const { goals: { GoalFollow, GoalNear } } = require('mineflayer-pathfinder');
const { PLAYER_NAME } = require('../config.js');
const { sleep } = require('../utils.js');

async function follow(bot, playerName) {
    const targetName = playerName || PLAYER_NAME;
    const commandId = bot.currentCommandId;

    const player = bot.players[targetName]?.entity;
    if (!player) {
        return { success: false, error: `Player ${targetName} not found. Are you close enough?` };
    }

    // Start background loop
    followLoop(bot, targetName, commandId).catch(err => console.error("Follow loop error:", err));

    return { success: true, message: `I am now following ${targetName}.` };
}

async function followLoop(bot, targetName, commandId) {
    let lastPosition = null;
    let state = 'init';

    while (bot.currentCommandId === commandId) {
        const player = bot.players[targetName]?.entity;

        if (player) {
            lastPosition = player.position.clone();

            // If we were not following (init, searching, or lost), resume following
            if (state !== 'following') {
                console.log(`INFO: Following ${targetName}`);
                bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
                state = 'following';
            }
        } else {
            // Player lost
            if (state === 'following') {
                console.log(`INFO: Lost sight of ${targetName}.`);
                state = 'searching';

                if (lastPosition) {
                    // Go to last known position
                    bot.pathfinder.setGoal(new GoalNear(lastPosition.x, lastPosition.y, lastPosition.z, 2));
                } else {
                    state = 'lost';
                }
            } else if (state === 'searching') {
                // Check if we arrived at last known position
                if (lastPosition && bot.entity.position.distanceTo(lastPosition) < 3) {
                    console.log(`INFO: Arrived at last known position.`);
                    bot.chat(`I lost you, ${targetName}.`);
                    state = 'lost';
                }
            }
        }

        await sleep(1000);
    }
    
    // Cleanup if interrupted
    if (bot.currentCommandId !== commandId) {
        bot.pathfinder.setGoal(null);
        console.log("INFO: Follow interrupted.");
    }
}

module.exports = { follow };
