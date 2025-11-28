// src/skills/patrol.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const { sleep } = require('../utils.js');
const { fight } = require('./fight.js');

async function patrol(bot, distance = 20) {
    const commandId = bot.currentCommandId;
    const center = bot.entity.position.clone();

    bot.chat(`Patrolling within ${distance} blocks.`);

    while (bot.currentCommandId === commandId) {
        // Pick a random point within radius
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * distance;
        const dx = Math.sin(angle) * dist;
        const dz = Math.cos(angle) * dist;

        const tx = center.x + dx;
        const tz = center.z + dz;

        try {
            // Go to point
            await bot.pathfinder.goto(new GoalNear(tx, center.y, tz, 2));
        } catch (err) {
            // Ignore unreachable points
        }

        if (bot.currentCommandId !== commandId) break;

        // Look around
        await bot.look(Math.random() * Math.PI * 2, 0);

        // Scan for enemies
        const target = bot.nearestEntity(e =>
            (e.kind === 'HostileMobs' || e.type === 'mob') &&
            e.position.distanceTo(bot.entity.position) < 10 &&
            e.name !== 'Armor Stand' &&
            e !== bot.entity
        );

        if (target) {
             bot.chat(`Engaging ${target.name} during patrol.`);
             await fight(bot, target);
        }

        await sleep(2000 + Math.random() * 2000);
    }

    if (bot.currentCommandId !== commandId) {
        bot.pathfinder.setGoal(null);
    }

    return { success: true, message: "Patrol stopped." };
}

module.exports = { patrol };
