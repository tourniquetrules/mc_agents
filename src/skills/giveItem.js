// giveItem.js located in ./skills

const { goNear } = require('./goNear');

async function giveItem(bot, itemName, count = 1, playerName = null) {
    const mcData = require('minecraft-data')(bot.version);
    const itemType = mcData.itemsByName[itemName];
    
    if (!itemType) {
        return { success: false, error: `Unknown item: ${itemName}` };
    }

    const item = bot.inventory.findInventoryItem(itemType.id);
    if (!item) {
        return { success: false, error: `I don't have any ${itemName}.` };
    }

    if (count > item.count) {
        count = item.count; // Toss all we have if requested more than available
    }

    if (playerName) {
        const target = bot.players[playerName] ? bot.players[playerName].entity : null;
        if (!target) {
            return { success: false, error: `I can't see ${playerName} nearby.` };
        }
        
        // Go near the player first
        await goNear(bot, target.position, 3);
        
        // Look at the player
        await bot.lookAt(target.position.offset(0, 1.6, 0));
    }

    try {
        await bot.toss(itemType.id, null, count);
        return { success: true, message: `Dropped ${count} ${itemName}${playerName ? ' to ' + playerName : ''}.` };
    } catch (err) {
        return { success: false, error: `Failed to toss item: ${err.message}` };
    }
}

module.exports = { giveItem };
