// src/skills/fight.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function fight(bot, targetOrName) {
    const commandId = bot.currentCommandId;

    let target = null;
    let targetName = "";

    if (typeof targetOrName === 'string') {
        targetName = targetOrName.toLowerCase();
        // Find target
        target = bot.nearestEntity(entity =>
            entity.name && entity.name.toLowerCase() === targetName &&
            entity.position.distanceTo(bot.entity.position) < 32 &&
            (entity.kind === 'HostileMobs' || entity.type === 'mob')
        );
        if (!target) return { success: true, message: `No ${targetName} found nearby.` };
    } else if (typeof targetOrName === 'object' && targetOrName !== null) {
        target = targetOrName;
        targetName = (target.name || "enemy").toLowerCase();
    } else {
        return { success: false, error: "Invalid target." };
    }

    // Equip logic based on targetName
    if (targetName === 'skeleton') {
        const hasBow = bot.inventory.items().some(i => i.name === 'bow');
        const hasArrows = bot.inventory.items().some(i => i.name.includes('arrow'));

        if (hasBow && hasArrows) {
             try {
                const bow = bot.inventory.items().find(i => i.name === 'bow');
                await bot.equip(bow, 'hand');
            } catch (err) {
                console.log("Failed to equip bow", err);
            }
        } else {
            console.log("No bow/arrows, trying melee.");
            const swords = bot.inventory.items().filter(i => i.name.includes('sword'));
            if (swords.length > 0) await bot.equip(swords[0], 'hand');
        }

    } else {
        // Zombie or others - melee
        const swords = bot.inventory.items().filter(i => i.name.includes('sword'));
        // Sort swords
        const tierOrder = ['netherite', 'diamond', 'iron', 'stone', 'golden', 'wooden'];
        swords.sort((a, b) => {
            const aTier = tierOrder.findIndex(t => a.name.includes(t));
            const bTier = tierOrder.findIndex(t => b.name.includes(t));
            const aVal = aTier === -1 ? 99 : aTier;
            const bVal = bTier === -1 ? 99 : bTier;
            return aVal - bVal;
        });

        if (swords.length > 0) {
             try {
                 await bot.equip(swords[0], 'hand');
             } catch (err) {
                 console.log("Failed to equip sword", err);
             }
        }
    }

    // Combat Loop
    try {
        const holdingBow = bot.heldItem && bot.heldItem.name === 'bow';

        if (targetName === 'skeleton' && holdingBow) {
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
                     // Too close?
                 }

                 // Look at target
                 await bot.lookAt(target.position.offset(0, target.height * 0.8, 0));

                 // Check arrows
                 const hasArrows = bot.inventory.items().some(i => i.name.includes('arrow'));
                 if (!hasArrows) {
                     console.log("Out of arrows, switching to melee");
                     break; // Fall out to melee or return?
                     // Return for now as we might not have sword equipped logic here dynamic
                 }

                 bot.activateItem();
                 await bot.waitForTicks(20);
                 bot.deactivateItem();

                 await bot.waitForTicks(10);
             }

             if (!target.isValid || target.health <= 0)
                return { success: true, message: "Skeleton defeated." };

        }

        // Melee Combat (Fallthrough or default)
        {
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
