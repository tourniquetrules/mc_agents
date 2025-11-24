// placeBlock.js located in ./skills
const Vec3 = require('vec3');
const { goNear } = require('./goNear');
const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function placeBlock(bot, blockName) {
    const mcData = require('minecraft-data')(bot.version);
    const item = mcData.itemsByName[blockName];
    
    if (!item) {
        return { success: false, error: `Unknown block name: ${blockName}` };
    }

    const invItem = bot.inventory.findInventoryItem(item.id);
    if (!invItem) {
        return { success: false, error: `I don't have any ${blockName} in my inventory.` };
    }

    // Find a block that has air above it to place on top of
    const range = 5;
    let placeableBlock = null;
    const allowedAir = ['air', 'cave_air', 'void_air', 'grass', 'tall_grass', 'short_grass', 'fern', 'snow'];

    try {
        // First try to find a block in front of the bot
        const yaw = bot.entity.yaw;
        const lookDir = new Vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const frontPos = bot.entity.position.offset(lookDir.x, -1, lookDir.z).floor();
        const frontBlock = bot.blockAt(frontPos);

        if (frontBlock && frontBlock.boundingBox === 'block') {
            const above = bot.blockAt(frontPos.offset(0, 1, 0));
            if (above && allowedAir.includes(above.name)) {
                placeableBlock = frontBlock;
                console.log(`INFO: Found block in front: ${frontBlock.name} at ${frontBlock.position}`);
            }
        }

        // If not found in front, search nearby
        if (!placeableBlock) {
            placeableBlock = bot.findBlock({
                matching: (blk) => {
                    if (!blk || !blk.position) return false;
                    // Must be solid
                    if (blk.boundingBox !== 'block') return false;
                    // Must have air above
                    const above = bot.blockAt(blk.position.offset(0, 1, 0));
                    if (!above || !allowedAir.includes(above.name)) return false;

                    // Prevent placing inside the bot
                    const botPos = bot.entity.position.floor();
                    if (above.position.equals(botPos)) return false; // Feet
                    if (above.position.equals(botPos.offset(0, 1, 0))) return false; // Head

                    return true;
                },
                maxDistance: range,
                useExtraInfo: true 
            });
        }
    } catch (e) {
        console.error("Error finding block:", e);
    }

    if (!placeableBlock) {
         // Debug: check block under feet
         const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
         console.log(`DEBUG: Block under feet: ${under ? under.name : 'null'}`);
         return { success: false, error: "No suitable spot found to place the block (need clear space above a solid block)." };
    }
    
    await goNear(bot, placeableBlock.position);

    // Verify we aren't standing in the placement location and move away if needed
    const targetPos = placeableBlock.position.offset(0, 1, 0);
    const targetCenter = targetPos.offset(0.5, 0, 0.5);
    const botPos = bot.entity.position;
    
    // Check 2D distance
    const dx = botPos.x - targetCenter.x;
    const dz = botPos.z - targetCenter.z;
    const distSq = dx*dx + dz*dz;

    // If we are within ~1.3 blocks horizontally (collision radius is usually < 0.8, but let's be safe)
    // and roughly at the same Y level
    if (distSq < 1.7 && Math.abs(botPos.y - targetPos.y) < 2) {
        console.log("INFO: Too close to placement spot, attempting to move away...");
        
        // Calculate a position away from the target
        let moveDir = new Vec3(dx, 0, dz).normalize();
        if (isNaN(moveDir.x) || moveDir.norm() === 0) moveDir = new Vec3(1, 0, 0);
        
        const goalPos = targetCenter.plus(moveDir.scaled(2.5)); // Move 2.5 blocks away
        
        try {
            // We use a small range (0.5) to ensure we actually move there
            await bot.pathfinder.goto(new GoalNear(goalPos.x, goalPos.y, goalPos.z, 0.5));
            await new Promise(resolve => setTimeout(resolve, 500)); // Let physics settle
        } catch (e) {
            console.log("WARN: Failed to move away:", e.message);
            return { success: false, error: "I am standing too close and couldn't move away." };
        }
    }

    // Equip the item
    try {
        await bot.equip(invItem, 'hand');
    } catch (err) {
        return { success: false, error: `Failed to equip ${blockName}: ${err.message}` };
    }

    try {
        // Look at the block to ensure placement works
        await bot.lookAt(placeableBlock.position.offset(0.5, 1, 0.5));
        await new Promise(resolve => setTimeout(resolve, 250)); // Wait for look to register
        await bot.placeBlock(placeableBlock, new Vec3(0, 1, 0));
        return { success: true, message: `Placed ${blockName} at ${placeableBlock.position.offset(0, 1, 0)}` };
    } catch (err) {
        console.error(err);
        return { success: false, error: `Failed to place block: ${err.message}` };
    }
}

module.exports = { placeBlock };
