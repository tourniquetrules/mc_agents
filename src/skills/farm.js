// src/skills/farm.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const { sleep } = require('../utils.js');
const Vec3 = require('vec3');

async function farm(bot) {
    const commandId = bot.currentCommandId;
    bot.chat("Starting farming loop. I will harvest mature crops and replant.");

    const CROP_TYPES = ['wheat', 'carrots', 'potatoes', 'beetroots'];
    const SEEDS = {
        'wheat': 'wheat_seeds',
        'carrots': 'carrot',
        'potatoes': 'potato',
        'beetroots': 'beetroot_seeds'
    };

    while (bot.currentCommandId === commandId) {
        let didWork = false;

        // 1. Harvest mature crops
        const matureCrops = bot.findBlocks({
            matching: (block) => {
                if (!CROP_TYPES.includes(block.name)) return false;

                // Check age
                const props = block.properties || block._properties || {};
                const age = parseInt(props.age || block.metadata);

                if (block.name === 'beetroots' && age >= 3) return true;
                if (block.name !== 'beetroots' && age >= 7) return true;
                return false;
            },
            maxDistance: 20,
            count: 3
        });

        for (const pos of matureCrops) {
            if (bot.currentCommandId !== commandId) break;

            const block = bot.blockAt(pos);
            if (!block) continue;

            // Go to crop
            await bot.pathfinder.goto(new GoalNear(pos.x, pos.y, pos.z, 2));

            // Harvest
            try {
                await bot.dig(block);
                didWork = true;

                // Collect drops (pickup range ~2, but ensuring close)
                // We are already at dist 2 via goto.
                // Maybe wait a tick for drops?
                await sleep(500);

                // Replant
                const seedName = SEEDS[block.name];
                const seeds = bot.inventory.items().find(i => i.name === seedName);
                if (seeds) {
                    await bot.equip(seeds, 'hand');
                    const farmland = bot.blockAt(pos.offset(0, -1, 0));
                    if (farmland && farmland.name === 'farmland') {
                         await bot.placeBlock(farmland, new Vec3(0, 1, 0));
                    }
                }
            } catch (err) {
                console.log("Harvest error:", err.message);
            }
        }

        if (bot.currentCommandId !== commandId) break;

        // 2. Plant on empty farmland
        const emptyFarmland = bot.findBlocks({
            matching: (block) => {
                if (block.name !== 'farmland') return false;
                const above = bot.blockAt(block.position.offset(0, 1, 0));
                return above && above.name === 'air';
            },
            maxDistance: 20,
            count: 3
        });

        for (const pos of emptyFarmland) {
             if (bot.currentCommandId !== commandId) break;

             const availableSeeds = Object.values(SEEDS).filter(s => bot.inventory.items().some(i => i.name === s));
             if (availableSeeds.length === 0) break;

             // Prefer seed type if we have it
             const seedName = availableSeeds[0];
             const seed = bot.inventory.items().find(i => i.name === seedName);

             await bot.pathfinder.goto(new GoalNear(pos.x, pos.y, pos.z, 2));

             try {
                 await bot.equip(seed, 'hand');
                 const farmland = bot.blockAt(pos);
                 await bot.placeBlock(farmland, new Vec3(0, 1, 0));
                 didWork = true;
             } catch (err) {
                 console.log("Plant error:", err.message);
             }
        }

        if (!didWork) {
            await sleep(2000);
        } else {
            await sleep(500);
        }
    }

    // Cleanup
    if (bot.currentCommandId !== commandId) {
        bot.pathfinder.setGoal(null);
    }

    return { success: true, message: "Farming stopped." };
}

module.exports = { farm };
