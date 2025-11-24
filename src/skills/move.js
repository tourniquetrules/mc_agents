// src/skills/move.js

const { goals: { GoalNear } } = require('mineflayer-pathfinder');

async function move(bot, direction, distance = 1) {
    const yaw = bot.entity.yaw;
    let angle = 0;

    // Normalizing direction
    const dir = direction.toLowerCase();

    if (dir === 'forward' || dir === 'front') {
        angle = 0;
    } else if (dir === 'back' || dir === 'backward' || dir === 'backwards') {
        angle = Math.PI;
    } else if (dir === 'left') {
        angle = -Math.PI / 2;
    } else if (dir === 'right') {
        angle = Math.PI / 2;
    } else {
        return { success: false, error: "Unknown direction. Use forward, back, left, or right." };
    }

    const targetYaw = yaw + angle;

    // Calculate delta
    // x = -sin(yaw) * d
    // z = cos(yaw) * d
    const dx = -Math.sin(targetYaw) * distance;
    const dz = Math.cos(targetYaw) * distance;

    const targetPos = bot.entity.position.offset(dx, 0, dz);

    try {
        await bot.pathfinder.goto(new GoalNear(targetPos.x, targetPos.y, targetPos.z, 0.5));
        return { success: true, message: `Moved ${direction} ${distance} blocks.` };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = { move };
