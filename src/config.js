const MINECRAFT_HOST = "localhost";
const MINECRAFT_PORT = "25565";

// OpenRouter / OpenAI Configuration
const GPT_MODEL = "local-model";
const API_BASE_URL = "http://192.168.2.64:1234/v1";

const PLAYER_NAME = "TourniquetRules";

const BOT_CONFIG = {
    username: "Luddite",
    host: MINECRAFT_HOST,
    port: MINECRAFT_PORT,
    version: "1.21.8",
    viewDistance: "tiny",
};

const START_POINT = { x: 356, y: 64, z: 64 }; // Forest
// const START_POINT = { x: 256, y: 63, z: 6 }; // Beach

module.exports = {
    MINECRAFT_HOST,
    MINECRAFT_PORT,
    PLAYER_NAME,
    BOT_CONFIG,
    START_POINT,
    GPT_MODEL,
    API_BASE_URL,
};