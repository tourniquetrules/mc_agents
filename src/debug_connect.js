const mineflayer = require('mineflayer');
const { MINECRAFT_HOST, MINECRAFT_PORT } = require('./config.js');

console.log(`Connecting to ${MINECRAFT_HOST}:${MINECRAFT_PORT} with version 1.21.1...`);

const bot = mineflayer.createBot({
    username: "debug_bot",
    host: MINECRAFT_HOST,
    port: MINECRAFT_PORT,
    version: "1.21.1",
    auth: 'offline'
});

bot.on('spawn', () => {
    console.log('Bot spawned!');
    bot.quit();
});

bot.on('error', (err) => {
    console.log('Error:', err);
});

bot.on('kicked', (reason) => {
    console.log('Kicked:', reason);
});

bot.on('end', (reason) => {
    console.log('Disconnected:', reason);
});

bot.on('login', () => {
    console.log('Logged in');
});
