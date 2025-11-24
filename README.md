# Minecraft ChatGPT Bot

A Minecraft bot powered by Mineflayer and OpenAI's ChatGPT that can interact with players in-game using natural language.

## Features

- 🤖 Intelligent conversation powered by ChatGPT
- 💬 Responds to in-game chat messages and whispers
- 🧠 Maintains conversation context for natural interactions
- 🎮 Easy to configure and deploy
- 🔒 Supports both online and offline mode servers

## Prerequisites

- Node.js (v16 or higher)
- A Minecraft server (Java Edition) to connect to
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tourniquetrules/mc_agents.git
cd mc_agents
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:
```env
OPENAI_API_KEY=your_openai_api_key_here
MC_HOST=localhost
MC_PORT=25565
MC_USERNAME=ChatGPTBot
MC_VERSION=1.20.1
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) | - |
| `MC_HOST` | Minecraft server hostname | `localhost` |
| `MC_PORT` | Minecraft server port | `25565` |
| `MC_USERNAME` | Bot's username | `ChatGPTBot` |
| `MC_VERSION` | Minecraft version | `1.20.1` |
| `MC_PASSWORD` | Password for online mode (leave empty for offline) | - |

### Getting an OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy the key to your `.env` file

## Usage

Start the bot:
```bash
npm start
```

### Interacting with the Bot

The bot responds to messages in two ways:

1. **Mention the bot's name in chat:**
```
Player: ChatGPTBot, what's the best way to mine diamonds?
Bot: The best way to mine diamonds is to dig down to Y-level -59...
```

2. **Use the !bot command:**
```
Player: !bot tell me about Minecraft
Bot: Minecraft is a sandbox video game where players can build...
```

3. **Whisper directly to the bot:**
```
/msg ChatGPTBot hello there
```

## How It Works

1. The bot connects to your Minecraft server using Mineflayer
2. It listens for chat messages that mention its name or use the `!bot` command
3. When triggered, it sends the message to ChatGPT for a response
4. ChatGPT generates a contextual, friendly response
5. The bot sends the response back in the game chat

## Development

The main bot logic is in `bot.js`. Key components:

- **Bot initialization**: Connects to the Minecraft server
- **Chat handlers**: Process incoming messages
- **ChatGPT integration**: Sends prompts and receives responses
- **Conversation history**: Maintains context for better responses

## Troubleshooting

### Bot won't connect
- Verify your server details in `.env`
- Check that the Minecraft server is running
- Ensure the Minecraft version matches your server

### ChatGPT not responding
- Verify your OpenAI API key is correct
- Check your OpenAI account has available credits
- Look for error messages in the console

### Rate limiting
If you experience rate limiting from OpenAI:
- Reduce the frequency of requests
- Consider upgrading your OpenAI plan
- Implement request throttling

## Security Notes

⚠️ **Important**: 
- Keep your `.env` file secure and never commit it to version control
- The `.gitignore` file is configured to exclude `.env`
- Be aware of OpenAI API costs and monitor your usage
- Current dependencies have some known vulnerabilities in upstream packages (mineflayer's transitive dependencies). Use in trusted environments only.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- [Mineflayer](https://github.com/PrismarineJS/mineflayer) - The Minecraft bot framework
- [OpenAI](https://openai.com/) - ChatGPT API
- [Node.js](https://nodejs.org/) - Runtime environment