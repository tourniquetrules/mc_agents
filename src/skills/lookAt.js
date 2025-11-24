// src/skills/lookAt.js

async function lookAt(bot, username) {
    const player = bot.players[username];

    if (!player || !player.entity) {
        return { success: false, error: `Player ${username} not found or not visible.` };
    }

    try {
        // Look at the player's eyes (offset y by height)
        const targetPos = player.entity.position.offset(0, player.entity.height, 0);
        await bot.lookAt(targetPos);
        return { success: true, message: `Looking at ${username}.` };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = { lookAt };
