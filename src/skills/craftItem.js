// craftItem.js located in ./skills
const { goNear } = require('./goNear');

async function craftItem(bot, itemName, count = 1) {
    const mcData = require('minecraft-data')(bot.version);
    const item = mcData.itemsByName[itemName];
    if (!item) {
        return { success: false, error: `Unknown item: ${itemName}` };
    }

    // 1. Check if we can craft it without a table
    const recipesNoTable = bot.recipesFor(item.id, null, 1, null);
    if (recipesNoTable.length > 0) {
        try {
            await bot.craft(recipesNoTable[0], count, null);
            return { success: true, message: `Crafted ${count} ${itemName}.` };
        } catch (e) {
            // Fall through to try table
        }
    }

    // 2. Find a crafting table
    const craftingTableBlock = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 32
    });

    if (!craftingTableBlock) {
        return { success: false, error: `I need a crafting table to craft ${itemName}, but none is nearby.` };
    }

    // 3. Go to table
    await goNear(bot, craftingTableBlock.position);

    // 4. Craft
    const recipes = bot.recipesFor(item.id, null, 1, craftingTableBlock);
    if (recipes.length === 0) {
        return { success: false, error: `I cannot craft ${itemName} (missing ingredients?).` };
    }

    try {
        await bot.craft(recipes[0], count, craftingTableBlock);
        return { success: true, message: `Crafted ${count} ${itemName}.` };
    } catch (err) {
        return { success: false, error: `Failed to craft ${itemName}: ${err.message}` };
    }
}

module.exports = { craftItem };
