// src/skills/guard.js
const { fight } = require('./fight.js');
const { sleep } = require('../utils.js');

async function guard(bot) {
    const commandId = bot.currentCommandId;
    bot.chat("Guard mode enabled. I will protect this area.");

    let lastHealth = bot.health;
    let forceTarget = null;

    const onHealth = () => {
        if (bot.health < lastHealth) {
             // We took damage. Find nearest threat.
             const threat = bot.nearestEntity(e =>
                 (e.kind === 'HostileMobs' || e.type === 'mob') &&
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
                    (entity.kind === 'HostileMobs' || entity.type === 'mob') &&
                    entity.position.distanceTo(bot.entity.position) <= 6 &&
                    entity.name !== 'Armor Stand' &&
                    entity !== bot.entity
                );
            }

            if (target) {
                forceTarget = null; // Clear force target
                // fight handles interruption check internally too
                await fight(bot, target);
            }

            await sleep(200);
        }
    } catch (err) {
        console.error("Guard error:", err);
    } finally {
        bot.removeListener('health', onHealth);
        if (bot.currentCommandId !== commandId) {
             bot.chat("Guard mode stopped.");
        }
    }

    return { success: true, message: "Guard mode ended." };
}

module.exports = { guard };
