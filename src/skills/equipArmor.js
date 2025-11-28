// src/skills/equipArmor.js
async function equipArmor(bot) {
    const ARMOR_SLOTS = {
        'head': 'helmet',
        'torso': 'chestplate',
        'legs': 'leggings',
        'feet': 'boots'
    };

    const TIERS = ['netherite', 'diamond', 'iron', 'chainmail', 'golden', 'leather'];

    let equippedCount = 0;

    for (const [slot, type] of Object.entries(ARMOR_SLOTS)) {
        // Find all items of this type
        const candidates = bot.inventory.items().filter(i => i.name.endsWith(`_${type}`) || i.name === type); // e.g. iron_helmet or leather_helmet (leather_helmet usually)

        if (candidates.length === 0) continue;

        // Sort by tier
        candidates.sort((a, b) => {
             const aTier = TIERS.findIndex(t => a.name.includes(t));
             const bTier = TIERS.findIndex(t => b.name.includes(t));
             const aVal = aTier === -1 ? 99 : aTier;
             const bVal = bTier === -1 ? 99 : bTier;
             return aVal - bVal;
        });

        const best = candidates[0];

        try {
            await bot.equip(best, slot);
            equippedCount++;
        } catch (err) {
            // Ignore if already equipped or fail
        }
    }

    return { success: true, message: `Checked and equipped ${equippedCount} armor pieces.` };
}

module.exports = { equipArmor };
