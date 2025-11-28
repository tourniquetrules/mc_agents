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
    let lastVelocity = null;
    let state = 'init';

    while (bot.currentCommandId === commandId) {
        const player = bot.players[targetName]?.entity;

        if (player) {
            lastPosition = player.position.clone();
            lastVelocity = player.velocity.clone();

            // If we were not following (init, searching, or lost), resume following
            if (state !== 'following') {
                console.log(`INFO: Following ${targetName}`);
                bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
                state = 'following';
            }
        } else {
            // Player lost
            if (state === 'following') {
                console.log(`INFO: Lost sight of ${targetName}. Attempting to predict path.`);
                state = 'searching';

                let targetPos = lastPosition;

                // Try to predict where they went based on velocity
                if (lastVelocity) {
                    // Velocity is per tick. Project 2 seconds (40 ticks)?
                    // But velocity decays.
                    // Simple projection: 3 blocks in that direction.
                    const speed = Math.sqrt(lastVelocity.x**2 + lastVelocity.z**2);
                    if (speed > 0.05) { // If moving
                         const lookAhead = lastVelocity.clone().normalize().scaled(4); // 4 blocks ahead
                         targetPos = lastPosition.clone().add(lookAhead);
                         console.log(`INFO: Predicting target at ${targetPos}`);
                    }
                }

                if (targetPos) {
                    bot.pathfinder.setGoal(new GoalNear(targetPos.x, targetPos.y, targetPos.z, 2));
                } else {
                    state = 'lost';
                }
            } else if (state === 'searching') {
                // Check if we reached the search target
                // GoalNear(2) means within 2 blocks.
                // bot.pathfinder.isMoving() returns true if still going.

                if (!bot.pathfinder.isMoving()) {
                    // We stopped moving (reached goal or stuck)

                    // Look around
                    const currentYaw = bot.entity.yaw;
                    await bot.look(currentYaw + Math.PI / 2, 0);
                    await sleep(500);
                    await bot.look(currentYaw - Math.PI / 2, 0);

                    if (!bot.players[targetName]?.entity) {
                         console.log(`INFO: Still can't see ${targetName}.`);
                         bot.chat(`I lost you, ${targetName}.`);
                         state = 'lost';
                    }
                }
            }
        }

        await sleep(250); // Check 4 times a second
    }
    
    // Cleanup if interrupted
    if (bot.currentCommandId !== commandId) {
        bot.pathfinder.setGoal(null);
        console.log("INFO: Follow interrupted.");
    }
}

module.exports = { follow };
