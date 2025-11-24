// mineBlock.js located in ./skills

const { goNear } = require('./goNear');
const { digBlock } = require('./digBlock');
const Vec3 = require('vec3');

async function mineBlock(bot, blockName, count = 1) {
    const mcData = require('minecraft-data')(bot.version);
    let minedCount = 0;

    // Resolve block ID
    // Handle "cobblestone" special case: In the world, it is "stone" (or deepslate, etc.)
    // But if the user specifically asks for "cobblestone", they usually mean "mine stone to get cobblestone".
    // However, if they ask for "stone", they might mean "stone".
    // Let's check if the block exists.
    let targetBlockName = blockName;
    
    // Handle common aliases
    // First, normalize spaces to underscores (e.g. "sugar cane" -> "sugar_cane")
    if (targetBlockName.includes(' ')) {
        targetBlockName = targetBlockName.replace(/ /g, '_');
    }

    if (blockName === 'cobblestone') {
        // Check if there is actual cobblestone nearby (placed by player/dungeon)
        // If not, assume they mean stone.
        const cobbleId = mcData.blocksByName['cobblestone'].id;
        const hasCobble = bot.findBlock({ matching: cobbleId, maxDistance: 32 });
        if (!hasCobble) {
            console.log("INFO: No cobblestone found, assuming user wants to mine stone.");
            targetBlockName = 'stone';
        }
    } else if (blockName === 'watermelon') {
        targetBlockName = 'melon';
    } else if (blockName === 'hay_bale' || blockName === 'hay bale') {
        targetBlockName = 'hay_block';
    }

    const blockType = mcData.blocksByName[targetBlockName];
    if (!blockType) {
        return { success: false, error: `Unknown block type: ${targetBlockName}` };
    }

    for (let i = 0; i < count; i++) {
        // Find the nearest block of this type
        const block = bot.findBlock({
            matching: (blk) => {
                if (blk.type !== blockType.id) return false;
                // If mining stone/deepslate, ensure it is exposed to air/water so we don't xray into walls
                // For ores, we might want to dig in, but for stone, surface is better.
                // Actually, let's just find any for now, but maybe prioritize visible ones?
                // bot.findBlock defaults to nearest, which is usually visible.
                return true;
            },
            maxDistance: 32,
            useExtraInfo: true
        });

        if (!block) {
            return { 
                success: true, 
                message: `Could not find any more ${targetBlockName} nearby. Mined ${minedCount} total.` 
            };
        }

        console.log(`INFO: Found ${blockName} at ${block.position}`);

        // Go to the block
        // For cactus, stay further away to avoid pricking
        const approachRange = (targetBlockName === 'cactus') ? 4 : 3;
        const moveResult = await goNear(bot, block.position, approachRange); 
        
        if (!moveResult.success) {
            console.log(`WARN: Could not reach ${blockName} at ${block.position}`);
            continue; 
        }

        // Equip appropriate tool (Pickaxe for ores)
        // We look for any pickaxe in inventory
        const pickaxes = bot.inventory.items().filter(item => item.name.includes('pickaxe'));
        if (pickaxes.length > 0) {
            // Simple sort: Diamond > Iron > Stone > Golden > Wooden
            const tierOrder = ['diamond', 'iron', 'stone', 'golden', 'wooden'];
            pickaxes.sort((a, b) => {
                const aTier = tierOrder.findIndex(t => a.name.includes(t));
                const bTier = tierOrder.findIndex(t => b.name.includes(t));
                // If not found in list (e.g. netherite), it gets -1. 
                // We want lower index (higher tier) first.
                // If both -1, equal. If one -1, it goes last? 
                // Actually let's just pick the first one found for now to be safe.
                return 0; 
            });
            
            try {
                await bot.equip(pickaxes[0], 'hand');
            } catch (err) {
                console.log("WARN: Failed to equip pickaxe:", err.message);
            }
        }

        // Dig the block
        try {
            await digBlock(bot, block);
            minedCount++;
            
            // Walk to the block position to collect drops
            // We wait a split second for the block to break and drop
            await new Promise(r => setTimeout(r, 500));
            
            // For cactus, don't walk directly into the spot (range 1) as items might be near other cactus
            // Range 2 should be close enough to pick up items (pickup radius is ~2 blocks)
            const collectRange = (targetBlockName === 'cactus') ? 2 : 1;
            await goNear(bot, block.position, collectRange);
        } catch (err) {
            console.error(`ERROR: Failed to mine block at ${block.position}:`, err);
            return { success: false, error: `Failed to mine ${blockName}: ${err.message}` };
        }
    }

    return { success: true, message: `Mined ${minedCount} ${blockName}.` };
}

module.exports = { mineBlock };
