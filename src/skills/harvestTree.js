// harvestTree.js located in ./skills

const { digBlock } = require('./digBlock');
const { goNear } = require('./goNear');
const { goTo } = require('./goTo');
const { queryInventory } = require('./queryInventory');
const { sleep } = require('../utils.js');
const Vec3 = require('vec3');

const LOG_BLOCKS = ['oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];

async function harvestTree(bot, direction = null) {
    const commandId = bot.currentCommandId;

    // Find the closest tree
    const treeBase = await findClosestTree(bot, direction);
    if (!treeBase) {
        console.log("INFO: No tree found within range.");
        return { success: true };
    }

    // Check interruption
    if (commandId && bot.currentCommandId !== commandId) return { success: false, message: "Interrupted" };

    // Go to the tree
    await goNear(bot, treeBase);

    // Check interruption
    if (commandId && bot.currentCommandId !== commandId) return { success: false, message: "Interrupted" };

    // Harvest the tree
    const droppedItems = [];
    await harvestAdjacentTreeBlocks(bot, droppedItems, treeBase, new Set(), commandId);

    // Check interruption
    if (commandId && bot.currentCommandId !== commandId) return { success: false, message: "Interrupted" };

    // Wait for last item to fall to the ground.
    await sleep(1000);

    // Collect the dropped logs
    console.log("INFO: Collecting items")
    try {
        for (const item of droppedItems) {
            if (commandId && bot.currentCommandId !== commandId) break;
            await goTo(bot, item.position);
        }
    } catch (error) {
        console.error(`ERROR: Failed to collect all dropped items: ${error}`)
    }
    console.log("INFO: Done collecting items")
    return { success: true, inventory: queryInventory(bot) };
}

async function findClosestTree(bot, direction = null) {
    const treeBlocks = LOG_BLOCKS;
    const maxDistance = 64; // Maximum search radius for trees

    const matching = (block) => {
        if (!treeBlocks.includes(block.name)) return false;
        if (direction) {
            // Check angle relative to bot
            const dx = block.position.x - bot.entity.position.x;
            const dz = block.position.z - bot.entity.position.z;

            // Calculate angle to block. Matches bot.entity.yaw: 0=South(+Z), PI/2=West(-X)
            // atan2(-dx, dz) produces this mapping
            const angleToBlock = Math.atan2(-dx, dz);

            // Normalize bot yaw to -PI to PI
            let botYaw = bot.entity.yaw % (2 * Math.PI);
            if (botYaw > Math.PI) botYaw -= 2 * Math.PI;
            if (botYaw < -Math.PI) botYaw += 2 * Math.PI;

            // Determine target angle based on direction
            let targetAngleOffset = 0;
            switch (direction.toLowerCase()) {
                case 'front': case 'forward': targetAngleOffset = 0; break;
                case 'back': case 'backward': targetAngleOffset = Math.PI; break;
                case 'left': targetAngleOffset = -Math.PI / 2; break; // East from South
                case 'right': targetAngleOffset = Math.PI / 2; break; // West from South
            }

            let targetAngle = botYaw + targetAngleOffset;
            if (targetAngle > Math.PI) targetAngle -= 2 * Math.PI;
            if (targetAngle < -Math.PI) targetAngle += 2 * Math.PI;

            // Difference
            let diff = Math.abs(angleToBlock - targetAngle);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;

            // Allow cone of 45 degrees (PI/4)
            return diff < Math.PI / 4;
        }
        return true;
    };

    const block = bot.findBlock({
        point: bot.entity.position,
        matching: matching,
        maxDistance: maxDistance,
        minCount: 1,
    });

    if (block) {
        // Return the base of the tree (assuming the lowest log block is the base)
        return new Vec3(block.position.x, block.position.y, block.position.z);
    } else {
        // Return null if no tree is found within the search radius
        return null;
    }
}

async function harvestAdjacentTreeBlocks(bot, droppedItems, position, visited = new Set(), commandId = null) {
    if (commandId && bot.currentCommandId !== commandId) return;

    const directions = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                directions.push(new Vec3(dx, dy, dz));
            }
        }
    }

    for (const direction of directions) {
        if (commandId && bot.currentCommandId !== commandId) return;

        const newPos = position.clone().add(direction);
        const key = newPos.toString();

        if (!visited.has(key)) {
            visited.add(key);
            const block = bot.blockAt(newPos);
            if (block && LOG_BLOCKS.includes(block.name)) {
                //console.log(`DEBUG: Tree block found at: ${newPos}`);
                
                // Listen for item drop
                const itemDropCallback = (entity) => {
                    if (entity.position.distanceTo(block.position) <= 5) {
                        droppedItems.push(entity);
                    }
                };
                bot.on('itemDrop', itemDropCallback);

                // Dig the block
                await digBlock(bot, block);

                // Stop listening for item drop
                bot.removeListener('itemDrop', itemDropCallback)

                // Continue harvesting
                await harvestAdjacentTreeBlocks(bot, droppedItems, newPos, visited, commandId);
            }
        }
    }
}

module.exports = {
    harvestTree
};
