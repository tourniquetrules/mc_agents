// src/skills/locateBlock.js
const Vec3 = require('vec3');

async function locateBlock(bot, blockName, count = 1) {
    const mcData = require('minecraft-data')(bot.version);

    let targetName = blockName.toLowerCase();
    if (targetName.includes(' ')) targetName = targetName.replace(/ /g, '_');

    // Simple alias handling
    if (targetName === 'diamond') targetName = 'diamond_ore';
    if (targetName === 'iron') targetName = 'iron_ore';
    if (targetName === 'gold') targetName = 'gold_ore';
    if (targetName === 'coal') targetName = 'coal_ore';

    const blockType = mcData.blocksByName[targetName];
    if (!blockType) return { success: false, error: `Unknown block: ${blockName}` };

    // Limit count
    const safeCount = Math.min(count, 5);

    const blocks = bot.findBlocks({
        matching: blockType.id,
        maxDistance: 64,
        count: safeCount
    });

    if (blocks.length === 0) {
        return { success: true, message: `No ${blockName} found nearby.` };
    }

    // Format response
    const locations = blocks.map(pos => `(${pos.x}, ${pos.y}, ${pos.z})`).join(", ");
    return { success: true, message: `Found ${blocks.length} ${blockName} at: ${locations}` };
}

module.exports = { locateBlock };
