// src/skills/fight.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function fight(bot, mobType) {
    const commandId = bot.currentCommandId;

    if (!mobType) return { success: false, error: "No mob type specified." };

    const targetName = mobType.toLowerCase();

    // Check requirements & Equip
    if (targetName === 'skeleton') {
        const hasBow = bot.inventory.items().some(i => i.name === 'bow');
        const hasArrows = bot.inventory.items().some(i => i.name.includes('arrow'));

        if (!hasBow) return { success: false, message: "I have no bow." };
        if (!hasArrows) return { success: false, message: "I have no arrows." };

        try {
            const bow = bot.inventory.items().find(i => i.name === 'bow');
            await bot.equip(bow, 'hand');
        } catch (err) {
            return { success: false, error: "Failed to equip bow." };
        }

    } else if (targetName === 'zombie') {
        const swords = bot.inventory.items().filter(i => i.name.includes('sword'));
        if (swords.length === 0) return { success: false, message: "I have no sword." };

        // Sort swords: Netherite > Diamond > Iron > Stone > Golden > Wooden
        const tierOrder = ['netherite', 'diamond', 'iron', 'stone', 'golden', 'wooden'];
        swords.sort((a, b) => {
            const aTier = tierOrder.findIndex(t => a.name.includes(t));
            const bTier = tierOrder.findIndex(t => b.name.includes(t));
            // Lower index is better. If not found (-1), put at end.
            const aVal = aTier === -1 ? 99 : aTier;
            const bVal = bTier === -1 ? 99 : bTier;
            return aVal - bVal;
        });

        try {
             await bot.equip(swords[0], 'hand');
        } catch (err) {
            return { success: false, error: "Failed to equip sword." };
        }
    } else {
        // Generic fight - try to equip sword if available
        const swords = bot.inventory.items().filter(i => i.name.includes('sword'));
        if (swords.length > 0) {
            await bot.equip(swords[0], 'hand');
        }
    }

    // Find target
    // We look for nearest entity of that type
    const target = bot.nearestEntity(entity =>
        entity.name && entity.name.toLowerCase() === targetName &&
        entity.position.distanceTo(bot.entity.position) < 32 &&
        (entity.kind === 'HostileMobs' || entity.type === 'mob')
    );

    if (!target) return { success: true, message: `No ${mobType} found nearby.` };

    // Combat Loop
    try {
        if (targetName === 'skeleton') {
             // Ranged Combat
             bot.pvp.stop(); // Ensure pvp plugin isn't interfering

             console.log(`INFO: Fighting skeleton with bow.`);

             while (target && target.isValid && target.health > 0) {
                 if (commandId && bot.currentCommandId !== commandId) {
                     return { success: false, message: "Interrupted" };
                 }

                 const dist = target.position.distanceTo(bot.entity.position);

                 // Keep distance
                 if (dist > 15) {
                     // Move closer
                     await bot.pathfinder.goto(new GoalNear(target.position.x, target.position.y, target.position.z, 14));
                 } else if (dist < 5) {
                     // Too close? Maybe back up? (Advanced)
                 }

                 // Look at target
                 // Aiming compensation involves physics, simplified here to looking at eye height
                 await bot.lookAt(target.position.offset(0, target.height * 0.8, 0));

                 // Check if we still have arrows
                 const hasArrows = bot.inventory.items().some(i => i.name.includes('arrow'));
                 if (!hasArrows) return { success: false, message: "Ran out of arrows." };

                 bot.activateItem(); // Draw bow
                 await bot.waitForTicks(20); // Charge
                 bot.deactivateItem(); // Shoot

                 await bot.waitForTicks(10); // Delay
             }

             return { success: true, message: "Skeleton defeated." };

        } else {
             // Melee Combat (Zombie or others)
             console.log(`INFO: Fighting ${targetName} with melee.`);
             await bot.pvp.attack(target);

             // Wait loop
             while (target && target.isValid && target.health > 0) {
                 if (commandId && bot.currentCommandId !== commandId) {
                     bot.pvp.stop();
                     return { success: false, message: "Interrupted" };
                 }
                 await new Promise(r => setTimeout(r, 500));
             }
             bot.pvp.stop();
             return { success: true, message: `Defeated ${targetName}.` };
        }
    } catch (err) {
        bot.pvp.stop();
        return { success: false, error: err.message };
    }
}

module.exports = { fight };
