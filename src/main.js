// main.js located in ./

const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const { BOT_CONFIG, START_POINT, PLAYER_NAME } = require('./config.js');
const { skillFunctions } = require('./skills.js');
const { createGPTAssistant, deleteGPTAssistant, performGPTCommand } = require('./gpt.js');

const botRegistry = {};

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function createBot(botConfig) {
    try {
        const bot = mineflayer.createBot(botConfig);

        bot.on('spawn', async () => {
            try {
                await onBotSpawn(bot);
            } catch (error) {
                await handleError(error);
            }
        });

        bot.on('chat', async (username, message) => {
            try {
                await onBotChat(bot, username, message);
            } catch (error) {
                await handleError(error);
            }
        });

        return bot;
    } catch (error) {
        await handleError(error);
    }
}

async function onBotSpawn(bot) {
    console.log(`@${bot.username} has spawned.`);

    // Create a GPT for this bot
    await createGPTAssistant(bot);

    // Pathfinder setup
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    const defaultMove = new Movements(bot, require('minecraft-data')(bot.version));
    
    // Configure movements for better indoor navigation
    defaultMove.canDig = false; // Don't break walls to get to player
    defaultMove.canOpenDoors = true; // Allow opening doors
    defaultMove.allow1by1towers = false; // Don't pillar up inside
    
    bot.pathfinder.setMovements(defaultMove);

    // Teleport to player if possible, otherwise start point
    console.log(`INFO: Attempting to teleport to ${PLAYER_NAME}`);
    bot.chat(`/tp ${bot.username} ${PLAYER_NAME}`);
    
    // Fallback to start point after a short delay if TP failed (optional logic, but for now we just do both or rely on the first working)
    // console.log(`INFO: Teleporting to (x=${START_POINT.x}, y=${START_POINT.y}, z=${START_POINT.z})`);
    // bot.chat(`/tp ${START_POINT.x} ${START_POINT.y} ${START_POINT.z}`);
}

async function onBotChat(bot, username, message) {

    // Only pay attention to messages directed at this bot
    if (!message.toLowerCase().startsWith(`@${bot.username.toLowerCase()}`)) {
        return;
    }

    console.log(`@${username}: ${message}`);

    // Remove the direct address
    const regex = new RegExp(`^@${bot.username}`, 'i');
    const command = message.replace(regex, '').trim();

    // Increment command ID to invalidate old commands
    bot.currentCommandId = (bot.currentCommandId || 0) + 1;
    const commandId = bot.currentCommandId;

    // Check for command strings
    if (command.startsWith('/')) {

        // Check for spawn command
        if (bot.username === BOT_CONFIG["username"] && command.startsWith("/spawn")) {
            const [_, botName] = command.split(' ');
            if (botRegistry[botName]) {
                console.log(`Bot ${botName} already exists.`);
                return;
            }
            const newBotConfig = { ...BOT_CONFIG, username: botName };
            botRegistry[botName] = await createBot(newBotConfig);
            return;
        }

        // Process some other command
        performCommand(bot, command).catch(err => console.error(err));
    } else {

        // Send command to GPT
        bot.chat("Thinking...");
        // Prepend the username so the AI knows who is speaking
        const gptPrompt = `@${username}: ${command}`;

        performGPTCommand(bot, gptPrompt, commandId).then(response => {
            if (bot.currentCommandId === commandId) {
                bot.chat(response);
            }
        }).catch(err => console.error(err));
    }
}

async function performCommand(bot, command) {
    if (command.startsWith('/create')) {

        if (!gptAssistant) {
            await createGPTAssistant(bot);
        }

    } else if (command.startsWith('/reset')) {

        if (bot.gptAssistant) {
            await deleteGPTAssistant(bot);
        }
        await createGPTAssistant(bot);

    } else if (command.startsWith('/delete')) {

        await deleteGPTAssistant(bot);

    } else if (command.startsWith('/come')) {

        await skillFunctions["come"](bot);

    } else if (command.startsWith('/inventory')) {

        await skillFunctions["queryInventory"](bot);

    } else if (command.startsWith('/store')) {

        await skillFunctions["storeInventory"](bot);

    } else if (command.startsWith('/harvesttree')) {

        await skillFunctions["harvestTree"](bot);

    } else if (command.startsWith('/collectitems')) {

        const [_, itemName, ...rest] = command.split(" ");

        await skillFunctions["collectItems"](bot, itemName);

    } else {
        console.warn(`Unrecognized command: ${command}`);
    }
}

async function handleError(error) {
    console.error(`ERROR: ${error}`);
    await cleanupBots();
    console.log('INFO: Exiting');
    process.exit(1);
}

async function cleanupBots() {
    console.log('INFO: Deleting GPTs before exiting');

    const deletePromises = Object.keys(botRegistry).map(botName => deleteGPTAssistant(botRegistry[botName]));
    await Promise.all(deletePromises);

    console.log('INFO: Cleanup complete');
}

// Modify the SIGINT handler to call cleanupBots
process.on('SIGINT', async () => {
    await cleanupBots();
    console.log('INFO: Exiting');
    process.exit();
});

// Initialize the bot
(async () => {
    botRegistry[BOT_CONFIG["username"]] = await createBot(BOT_CONFIG);
})();