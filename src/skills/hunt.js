// hunt.js located in ./skills
const { goNear } = require('./goNear');
const { goTo } = require('./goTo');
const { sleep } = require('../utils.js');

async function hunt(bot, animalType) {
    if (!animalType) {
        return { success: false, error: "You must specify an animal type (e.g., pig, cow, chicken)." };
    }

    // Find the nearest entity of that type
    const entity = bot.nearestEntity(e => e.name === animalType.toLowerCase());
    if (!entity) {
        return { success: false, error: `No ${animalType} found nearby.` };
    }

    console.log(`INFO: Hunting ${animalType} at ${entity.position}`);

    // Equip a weapon if we have one
    const sword = bot.inventory.items().find(item => item.name.includes('sword'));
    const axe = bot.inventory.items().find(item => item.name.includes('axe'));
    const weapon = sword || axe;
    if (weapon) {
        try {
            await bot.equip(weapon, 'hand');
        } catch (e) {
            console.log("INFO: Failed to equip weapon, using hand.");
        }
    }

    // Attack using pvp plugin
    try {
        await bot.pvp.attack(entity);
    } catch (e) {
        return { success: false, error: `Failed to attack: ${e.message}` };
    }

    // Wait for entity to die (simple check loop)
    let retries = 40; // Increased retries
    while (retries > 0) {
        await sleep(500);
        if (!entity.isValid) {
            break; // Entity is dead/gone
        }
        // Keep attacking if it's still alive and we are close
        if (retries % 5 === 0) {
             try {
                await bot.pvp.attack(entity);
            } catch (e) {}
        }
        retries--;
    }

    if (entity.isValid) {
        bot.pvp.stop();
        return { success: false, error: "Failed to kill the animal in time." };
    }

    bot.pvp.stop();
    console.log("INFO: Target killed. Collecting drops...");

    // Collect drops
    // We look for item entities near where the mob died
    await sleep(1000); // Wait for drops to spawn/settle
    
    const drops = bot.nearestEntity(e => e.name === 'item' && e.position.distanceTo(entity.position) < 5);
    if (drops) {
        try {
            await goNear(bot, drops.position);
            await sleep(500); // Wait to pick up
        } catch (e) {
            console.log("INFO: Could not reach drops, but kill was successful.");
        }
    }

    return { success: true, message: `Killed ${animalType} and collected drops.` };
}

module.exports = { hunt };
