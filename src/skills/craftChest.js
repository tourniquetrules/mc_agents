// craftChest.js located in ./skills
const { goNear } = require('./goNear');

async function craftChest(bot) {
    const mcData = require('minecraft-data')(bot.version);
    const chestItem = mcData.itemsByName.chest;
    
    // 1. Ensure we have enough planks (8 needed)
    const plankNames = ['oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks', 'acacia_planks', 'dark_oak_planks', 'mangrove_planks', 'cherry_planks', 'bamboo_planks', 'crimson_planks', 'warped_planks'];
    
    async function ensurePlanks(count) {
        let totalPlanks = 0;
        for (const name of plankNames) {
            const item = mcData.itemsByName[name];
            if (item) {
                const invItem = bot.inventory.findInventoryItem(item.id);
                if (invItem) totalPlanks += invItem.count;
            }
        }

        if (totalPlanks >= count) return true;

        console.log(`INFO: Have ${totalPlanks} planks, need ${count}. Trying to craft from logs...`);
        
        // Craft planks until we have enough
        while (totalPlanks < count) {
            let crafted = false;
            for (const plankName of plankNames) {
                const plankItem = mcData.itemsByName[plankName];
                if (!plankItem) continue;
                
                // Find a recipe for this plank (usually log -> 4 planks)
                // We don't need a table for planks
                const recipes = bot.recipesFor(plankItem.id, null, 1, null);
                for (const recipe of recipes) {
                    try {
                        await bot.craft(recipe, 1, null);
                        console.log(`INFO: Crafted ${plankName}`);
                        crafted = true;
                        totalPlanks += 4; // Assuming 1 log -> 4 planks
                        break;
                    } catch (e) {
                        // Cannot craft this one (maybe no logs of this type)
                    }
                }
                if (crafted && totalPlanks >= count) break;
            }
            
            if (!crafted) {
                return false; // Ran out of logs
            }
        }
        return true;
    }

    if (!(await ensurePlanks(8))) {
        return { success: false, error: "Not enough wood to make a chest. Please ask me to harvest a tree first." };
    }

    // 2. Find a crafting table nearby
    const craftingTableBlock = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 32
    });

    if (!craftingTableBlock) {
        return { success: false, error: "I need a crafting table nearby to make a chest. Please place one down." };
    }

    // 3. Go to the crafting table
    await goNear(bot, craftingTableBlock.position);

    // 4. Craft the chest
    const recipes = bot.recipesFor(chestItem.id, null, 1, craftingTableBlock);
    if (recipes.length === 0) {
        return { success: false, error: "Cannot find a recipe for chest (this is strange if I have planks)." };
    }

    try {
        await bot.craft(recipes[0], 1, craftingTableBlock);
        return { success: true, message: "Successfully crafted a chest." };
    } catch (err) {
        console.error(err);
        return { success: false, error: `Failed to craft chest: ${err.message}` };
    }
}

module.exports = { craftChest };
