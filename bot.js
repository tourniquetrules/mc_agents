const mineflayer = require('mineflayer');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const config = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.MC_USERNAME || 'ChatGPTBot',
  version: process.env.MC_VERSION || '1.20.1',
  auth: process.env.MC_PASSWORD ? 'microsoft' : 'offline'
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create bot
const bot = mineflayer.createBot(config);

// Conversation history for context
const conversationHistory = [];
const MAX_HISTORY = 10;

// Bot event handlers
bot.on('login', () => {
  console.log(`Bot logged in as ${bot.username}`);
});

bot.on('spawn', () => {
  console.log('Bot spawned in the game');
  console.log(`Position: ${bot.entity.position}`);
});

bot.on('chat', async (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return;

  console.log(`[${username}] ${message}`);

  // Check if the message is directed at the bot
  const botName = bot.username.toLowerCase();
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes(botName) || lowerMessage.startsWith('!bot')) {
    // Remove bot name from message for cleaner context
    const cleanMessage = message
      .replace(new RegExp(botName, 'gi'), '')
      .replace(/^!bot\s*/i, '')
      .trim();

    if (!cleanMessage) {
      bot.chat('Yes? How can I help you?');
      return;
    }

    try {
      const response = await getChatGPTResponse(username, cleanMessage);
      // Split long messages into chunks (Minecraft chat has character limits)
      const chunks = splitMessage(response, 100);
      for (const chunk of chunks) {
        bot.chat(chunk);
        // Small delay between messages
        await sleep(500);
      }
    } catch (error) {
      console.error('Error getting ChatGPT response:', error);
      bot.chat('Sorry, I encountered an error processing your request.');
    }
  }
});

bot.on('whisper', async (username, message) => {
  console.log(`[Whisper from ${username}] ${message}`);
  
  try {
    const response = await getChatGPTResponse(username, message);
    bot.whisper(username, response);
  } catch (error) {
    console.error('Error getting ChatGPT response:', error);
    bot.whisper(username, 'Sorry, I encountered an error processing your request.');
  }
});

bot.on('error', (err) => {
  console.error('Bot error:', err);
});

bot.on('kicked', (reason) => {
  console.log('Bot was kicked:', reason);
});

bot.on('end', () => {
  console.log('Bot disconnected');
});

// ChatGPT integration
async function getChatGPTResponse(username, message) {
  // Add user message to history
  conversationHistory.push({
    role: 'user',
    content: `${username}: ${message}`
  });

  // Trim history if too long
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory.shift();
  }

  const messages = [
    {
      role: 'system',
      content: `You are a helpful Minecraft bot named ${bot.username}. You are playing on a Minecraft server and can interact with players. Keep responses brief and friendly, suitable for in-game chat. You can discuss Minecraft gameplay, answer questions, and engage in conversation.`
    },
    ...conversationHistory
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content.trim();
    
    // Add assistant response to history
    conversationHistory.push({
      role: 'assistant',
      content: response
    });

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific error types
    if (error.status === 429) {
      throw new Error('Rate limit reached. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OPENAI_API_KEY.');
    } else if (error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable.');
    } else {
      throw new Error('Failed to get response from ChatGPT.');
    }
  }
}

// Utility functions
function splitMessage(message, maxLength) {
  const chunks = [];
  let currentChunk = '';
  
  const words = message.split(' ');
  for (const word of words) {
    if ((currentChunk + ' ' + word).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + word : word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down bot...');
  bot.quit();
  process.exit(0);
});
