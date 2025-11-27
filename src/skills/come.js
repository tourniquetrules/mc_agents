// come.js located in ./skills

const { goNear } = require('./goNear');
const { PLAYER_NAME } = require('../config.js');

async function come(bot, playerName=PLAYER_NAME) {
    const player = bot.players[playerName]?.entity;
    if (!player) {
        return {success: false, error: `I can't see you (${playerName}).`};
    }

    const result = await goNear(bot, player.position);
    if (!result.success) {
        return { success: false, message: `I tried to come to you but failed: ${result.error}` };
    }

    return {success: true, message: "I have arrived."};
}

module.exports = {
    come
};
