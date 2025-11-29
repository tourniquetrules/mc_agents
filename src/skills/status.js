// src/skills/status.js

async function status(bot) {
    const h = bot.health ? bot.health.toFixed(1) : '?';
    const f = bot.food ? bot.food.toFixed(1) : '?';
    const s = bot.foodSaturation ? bot.foodSaturation.toFixed(1) : '?';

    return {
        success: true,
        message: `Health: ${h}/20, Food: ${f}/20, Saturation: ${s}`
    };
}

module.exports = { status };
