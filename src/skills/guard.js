// src/skills/guard.js
const { fight } = require('./fight.js');
const { sleep } = require('../utils.js');

const HOSTILE_MOBS = [
    'zombie', 'skeleton', 'spider', 'cave_spider', 'creeper',
    'enderman', 'witch', 'phantom', 'drowned', 'husk', 'stray',
    'piglin', 'hoglin', 'zombified_piglin', 'blaze', 'ghast',
    'wither_skeleton', 'pillager', 'ravager', 'vex', 'vindicator',
    'evoker', 'guardian', 'elder_guardian', 'shulker', 'slime',
    'magma_cube', 'silverfish', 'endermite'
];

async function guard(bot) {
    const commandId = bot.currentCommandId;
    bot.chat("Guard mode enabled. I will protect this area.");

    let lastHealth = bot.health;
    let forceTarget = null;

    const onHealth = () => {
        if (bot.health < lastHealth) {
             // We took damage. Find nearest threat.
             const threat = bot.nearestEntity(e =>
                 e.name && HOSTILE_MOBS.includes(e.name.toLowerCase()) &&
                 e.position.distanceTo(bot.entity.position) < 20 &&
                 e !== bot.entity
             );
             if (threat) {
                 console.log(`Guard: Retaliating against ${threat.name}`);
                 forceTarget = threat;
             }
        }
        lastHealth = bot.health;
    };

    bot.on('health', onHealth);

    try {
        while (bot.currentCommandId === commandId) {
            let target = forceTarget;

            if (!target) {
                // Scan for mobs within 6 blocks
                target = bot.nearestEntity(entity =>
                    entity.name && HOSTILE_MOBS.includes(entity.name.toLowerCase()) &&
                    entity.position.distanceTo(bot.entity.position) <= 6 &&
                    entity !== bot.entity
                );
            }

            if (target) {
                forceTarget = null; // Clear force target
                await fight(bot, target);
            }

            await sleep(200);
        }
    } catch (err) {
        console.error("Guard error:", err);
    } finally {
        bot.removeListener('health', onHealth);
        // Only chat stopped if we weren't interrupted by another command (which handles its own chat)
        // But here we are checking if currentCommandId matched at start.
        // If it DOESN'T match, we were interrupted.
        if (bot.currentCommandId === commandId) {
             bot.chat("Guard mode stopped.");
        }
    }

    return { success: true, message: "Guard mode ended." };
}

module.exports = { guard };
