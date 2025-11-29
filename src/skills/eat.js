// src/skills/eat.js

async function eat(bot, foodName = null) {
    if (bot.food === 20) {
        return { success: true, message: "I am already full (20/20 food)." };
    }

    let food;
    if (foodName) {
        food = bot.inventory.items().find(item => item.name.includes(foodName.toLowerCase()) && item.foodPoints > 0);
        if (!food) {
            return { success: false, message: `I don't have any ${foodName} to eat.` };
        }
    } else {
        // Pick best food
        const foods = bot.inventory.items().filter(item => item.foodPoints > 0);
        if (foods.length === 0) {
            return { success: false, message: "I have no food to eat." };
        }
        // Sort by food points descending
        foods.sort((a, b) => b.foodPoints - a.foodPoints);
        food = foods[0];
    }

    try {
        console.log(`INFO: Eating ${food.name}`);
        await bot.equip(food, 'hand');
        await bot.consume();
        return { success: true, message: `Ate ${food.name}. Food level: ${bot.food}` };
    } catch (err) {
        console.error("Eat error:", err);
        return { success: false, error: `Failed to eat ${food.name}: ${err.message}` };
    }
}

module.exports = { eat };
