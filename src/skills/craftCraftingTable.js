// craftCraftingTable.js located in ./skills

async function craftCraftingTable(bot) {
    const mcData = require('minecraft-data')(bot.version);
    const craftingTableItem = mcData.itemsByName.crafting_table;
    
    // Check if we already have one
    const hasTable = bot.inventory.findInventoryItem(craftingTableItem.id);
    if (hasTable) {
        return { success: true, message: "I already have a crafting table." };
    }

    // Helper to find a recipe we can do
    function findRecipe(itemId) {
        const recipes = bot.recipesFor(itemId, null, 1, null);
        return recipes[0]; // Just take the first one for now
    }

    // Check for planks
    const plankNames = ['oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks', 'acacia_planks', 'dark_oak_planks', 'mangrove_planks', 'cherry_planks', 'bamboo_planks', 'crimson_planks', 'warped_planks'];
    
    let totalPlanks = 0;
    for (const name of plankNames) {
        const item = mcData.itemsByName[name];
        if (item) {
            const invItem = bot.inventory.findInventoryItem(item.id);
            if (invItem) totalPlanks += invItem.count;
        }
    }

    if (totalPlanks < 4) {
        // Try to craft planks from logs
        console.log("INFO: Not enough planks, trying to craft from logs...");
        
        // We need to find a plank recipe we can fulfill
        let crafted = false;
        for (const plankName of plankNames) {
            const plankItem = mcData.itemsByName[plankName];
            if (!plankItem) continue;
            
            const recipes = bot.recipesFor(plankItem.id, null, 1, null);
            for (const recipe of recipes) {
                try {
                    await bot.craft(recipe, 1, null);
                    console.log(`INFO: Crafted ${plankName}`);
                    crafted = true;
                    break;
                } catch (e) {
                    // Cannot craft this one, continue
                }
            }
            if (crafted) break;
        }

        if (!crafted) {
            return { success: false, error: "Not enough wood. Please ask me to harvest a tree first." };
        }
    }

    // Craft the table
    const recipe = bot.recipesFor(craftingTableItem.id, null, 1, null)[0];
    if (!recipe) {
        return { success: false, error: "No recipe found for crafting table (this shouldn't happen)." };
    }

    try {
        await bot.craft(recipe, 1, null);
        return { success: true, message: "Successfully crafted a crafting table." };
    } catch (err) {
        console.error(err);
        return { success: false, error: `Failed to craft: ${err.message}` };
    }
}

module.exports = { craftCraftingTable };
