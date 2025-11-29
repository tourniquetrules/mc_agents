// src/skills/toss.js
const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const { PLAYER_NAME } = require('../config.js');

async function tossItem(bot, itemName) {
    const player = bot.players[PLAYER_NAME]?.entity;
    if (!player) return { success: false, message: "I can't see you to toss items." };

    const item = bot.inventory.items().find(i => i.name.includes(itemName));
    if (!item) return { success: false, message: `I don't have any ${itemName}.` };

    await bot.pathfinder.goto(new GoalNear(player.position.x, player.position.y, player.position.z, 3));

    await bot.lookAt(player.position.offset(0, 1.6, 0));
    await bot.tossStack(item);

    return { success: true, message: `Tossed ${item.name} to you.` };
}

module.exports = { tossItem };
