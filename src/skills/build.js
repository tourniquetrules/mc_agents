// src/skills/build.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const Vec3 = require('vec3');

async function build(bot, structureName) {
    const commandId = bot.currentCommandId;
    const name = structureName.toLowerCase();

    const buildingBlock = bot.inventory.items().find(i =>
        i.name.includes('cobblestone') ||
        i.name.includes('planks') ||
        i.name.includes('stone') ||
        i.name.includes('dirt')
    );

    if (!buildingBlock) return { success: false, message: "I have no blocks to build with (need dirt, stone, or planks)." };

    await bot.equip(buildingBlock, 'hand');

    // Build 2 blocks in front
    // We assume flat ground for simplicity
    const startPos = bot.entity.position.floored().offset(2, 0, 0);

    if (name === 'pillar') {
        // Build 3 blocks high
        for (let y = 0; y < 3; y++) {
            if (bot.currentCommandId !== commandId) break;
            const target = startPos.offset(0, y, 0);

            const referencePos = target.offset(0, -1, 0);
            const referenceBlock = bot.blockAt(referencePos);

            // Ensure we can reach
            await bot.pathfinder.goto(new GoalNear(target.x, target.y, target.z, 4));

            if (referenceBlock) {
                try {
                    await bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
                } catch (err) {
                    // Ignore (maybe block already there)
                }
            }
        }
        return { success: true, message: "Built pillar." };
    } else if (name === 'wall') {
        // 3x2 wall
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 2; y++) {
                if (bot.currentCommandId !== commandId) break;
                const target = startPos.offset(x, y, 0); // Along X axis

                const referencePos = target.offset(0, -1, 0);
                const referenceBlock = bot.blockAt(referencePos);

                await bot.pathfinder.goto(new GoalNear(target.x, target.y, target.z, 4));

                if (referenceBlock) {
                    try {
                        await bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
                    } catch (err) {}
                }
            }
        }
        return { success: true, message: "Built wall." };
    }

    return { success: false, message: `Unknown structure: ${name}. Try 'pillar' or 'wall'.` };
}

module.exports = { build };
