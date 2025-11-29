// src/skills/smelt.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const { sleep } = require('../utils.js');

async function smelt(bot, itemName, fuelName) {
    const commandId = bot.currentCommandId;

    // Find furnace
    const furnaceBlock = bot.findBlock({ matching: block => block.name === 'furnace', maxDistance: 32 });
    if (!furnaceBlock) return { success: false, message: "No furnace found nearby." };

    // Find items
    const inputItem = bot.inventory.items().find(i => i.name.includes(itemName));
    const fuelItem = bot.inventory.items().find(i => i.name.includes(fuelName));

    if (!inputItem) return { success: false, message: `No ${itemName} found in inventory.` };
    if (!fuelItem) return { success: false, message: `No ${fuelName} found in inventory.` };

    // Go to furnace
    try {
        await bot.pathfinder.goto(new GoalNear(furnaceBlock.position.x, furnaceBlock.position.y, furnaceBlock.position.z, 1));
    } catch (err) {
        return { success: false, error: "Cannot reach furnace." };
    }

    if (bot.currentCommandId !== commandId) return { success: false, message: "Interrupted" };

    // Open furnace
    const furnace = await bot.openFurnace(furnaceBlock);

    try {
        await furnace.putInput(inputItem.type, null, inputItem.count);
        await furnace.putFuel(fuelItem.type, null, fuelItem.count);

        bot.chat("Smelting started...");

        // Wait loop
        while (bot.currentCommandId === commandId) {
             await sleep(1000);

             // Check output
             const output = furnace.outputItem();
             if (output && output.count > 0) {
                 await furnace.takeOutput();
                 bot.chat(`Collected ${output.count} ${output.name}.`);
             }

             // Check if done (input empty and not cooking?)
             // Or just input empty.
             const input = furnace.inputItem();
             if (!input || input.count === 0) {
                 // Check if output is empty too (might be last batch)
                 if (!output || output.count === 0)
                    break;
             }
        }
    } catch (err) {
        return { success: false, error: err.message };
    } finally {
        furnace.close();
    }

    return { success: true, message: "Smelting complete." };
}

module.exports = { smelt };
