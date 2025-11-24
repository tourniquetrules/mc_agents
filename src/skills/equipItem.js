// equipItem.js located in ./skills

async function equipItem(bot, itemName, destination = 'hand') {
    const mcData = require('minecraft-data')(bot.version);
    
    // Helper to find best item of a category
    const findBestItem = (category) => {
        const items = bot.inventory.items();
        const matching = items.filter(i => i.name.includes(category));
        // Simple priority: netherite > diamond > iron > stone > wooden > gold
        const materials = ['netherite', 'diamond', 'iron', 'stone', 'wooden', 'gold'];
        
        matching.sort((a, b) => {
            const aMat = materials.findIndex(m => a.name.startsWith(m));
            const bMat = materials.findIndex(m => b.name.startsWith(m));
            // If both are in the list, lower index is better. If one isn't, it's worse.
            if (aMat === -1) return 1;
            if (bMat === -1) return -1;
            return aMat - bMat;
        });
        
        return matching.length > 0 ? matching[0] : null;
    };

    let targetItemName = itemName;
    let invItem = null;

    // Check if it's a generic tool request
    if (['pickaxe', 'axe', 'sword', 'shovel', 'hoe'].includes(itemName)) {
        const best = findBestItem(itemName);
        if (best) {
            targetItemName = best.name;
            invItem = best;
        } else {
             return { success: false, error: `I don't have any ${itemName} in my inventory.` };
        }
    } else {
        // Exact match attempt
        const item = mcData.itemsByName[itemName];
        if (!item) {
            return { success: false, error: `Unknown item name: ${itemName}` };
        }
        invItem = bot.inventory.findInventoryItem(item.id);
    }

    if (!invItem) {
        return { success: false, error: `I don't have any ${targetItemName} in my inventory.` };
    }

    try {
        await bot.equip(invItem, destination);
        return { success: true, message: `Equipped ${targetItemName} in ${destination}.` };
    } catch (err) {
        return { success: false, error: `Failed to equip ${targetItemName}: ${err.message}` };
    }
}

module.exports = { equipItem };
