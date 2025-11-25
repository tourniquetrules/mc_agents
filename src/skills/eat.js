// src/skills/eat.js

async function eat(bot) {
    if (bot.food === 20) {
        return { success: true, message: "I am already full." };
    }

    const food = bot.inventory.items().find(item => item.foodPoints > 0);

    if (!food) {
        return { success: false, message: "I have no food to eat." };
    }

    try {
        await bot.equip(food, 'hand');
        await bot.consume();
        return { success: true, message: `Ate ${food.name}.` };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = { eat };
