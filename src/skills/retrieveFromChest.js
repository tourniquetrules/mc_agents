// retrieveFromChest.js located in ./skills
const { goNear } = require('./goNear');
const Vec3 = require('vec3');

async function retrieveFromChest(bot, itemName, count = 1) {
    const mcData = require('minecraft-data')(bot.version);
    const item = mcData.itemsByName[itemName];
    if (!item) {
        return { success: false, error: `Unknown item: ${itemName}` };
    }

    // Find nearest chest
    const chestBlock = bot.findBlock({
        matching: mcData.blocksByName.chest.id,
        maxDistance: 32
    });

    if (!chestBlock) {
        return { success: false, error: "No chest found nearby." };
    }

    try {
        await goNear(bot, chestBlock.position);
        const chest = await bot.openChest(chestBlock);
        
        const chestItem = chest.containerItems().find(i => i.name === itemName);
        if (!chestItem) {
            await chest.close();
            return { success: false, error: `Chest does not contain ${itemName}.` };
        }

        const amountToTake = Math.min(count, chestItem.count);
        await chest.withdraw(item.id, null, amountToTake);
        await chest.close();

        return { success: true, message: `Withdrew ${amountToTake} ${itemName} from chest.` };
    } catch (err) {
        return { success: false, error: `Failed to retrieve item: ${err.message}` };
    }
}

module.exports = { retrieveFromChest };
