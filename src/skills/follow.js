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
    let lastBotPos = bot.entity.position.clone();
    let stuckCount = 0;

    while (bot.currentCommandId === commandId) {
        const player = bot.players[targetName]?.entity;
        const currentBotPos = bot.entity.position.clone();

        // Stuck Check
        if (state === 'following' && bot.pathfinder.isMoving()) {
            const distMoved = currentBotPos.distanceTo(lastBotPos);
            if (distMoved < 0.1) {
                stuckCount++;
                if (stuckCount > 10) { // 2.5 seconds stuck
                    console.log("Follow: Stuck detected. Attempting jump.");
                    bot.setControlState('jump', true);
                    stuckCount = 0;
                }
            } else {
                stuckCount = 0;
                bot.setControlState('jump', false);
            }
        }
        lastBotPos = currentBotPos;

        if (player) {
            lastPosition = player.position.clone();
            lastVelocity = player.velocity.clone();

            if (state !== 'following') {
                console.log(`INFO: Following ${targetName}`);
                // Increased range to 3.5 to avoid crowding/stair issues
                bot.pathfinder.setGoal(new GoalFollow(player, 3.5), true);
                state = 'following';
            }
        } else {
            // Player lost
            if (state === 'following') {
                console.log(`INFO: Lost sight of ${targetName}. Attempting to predict path.`);
                state = 'searching';

                let targetPos = lastPosition;

                if (lastVelocity) {
                    const speed = Math.sqrt(lastVelocity.x**2 + lastVelocity.z**2);
                    if (speed > 0.05) {
                         const lookAhead = lastVelocity.clone().normalize().scaled(4);
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
                if (!bot.pathfinder.isMoving()) {
                    // Look around
                    const currentYaw = bot.entity.yaw;
                    await bot.look(currentYaw + Math.PI / 2, 0);
                    await sleep(500);
                    await bot.look(currentYaw - Math.PI / 2, 0);

                    if (!bot.players[targetName]?.entity) {
                         state = 'lost';
                         bot.chat(`I lost you, ${targetName}.`);
                    }
                }
            }
        }

        await sleep(250);
    }
    
    if (bot.currentCommandId !== commandId) {
        bot.pathfinder.setGoal(null);
        bot.setControlState('jump', false);
    }
}

module.exports = { follow };
