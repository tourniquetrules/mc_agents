# Minecraft Agents Project

## Overview

The Minecraft Agents project creates AI-powered bots in a Minecraft world using the Mineflayer JavaScript library. These bots can autonomously perform tasks, execute skills (e.g., navigating to trees, harvesting resources), and respond to natural language commands via integrated GPT/OpenAI models. The goal is to build bots that efficiently collect Minecraft items while avoiding dangers like falls, lava, mobs, and starvation.

Key features:
- **Multi-bot support**: Spawn multiple bots in the same world.
- **Skill-based actions**: Modular functions for tasks like movement, harvesting, and exploration.
- **GPT integration**: Use AI for interpreting and executing complex commands.
- **Safety mechanisms**: Bots are designed to avoid hazards and survive longer.

## How It Works

- **Core Technology**: Built with Node.js and Mineflayer. Bots use pathfinding plugins for navigation.
- **Skills System**: Skills are defined in `skills.js` and can call each other (e.g., a complex harvesting skill might use simpler movement skills).
- **AI Commands**: Non-command inputs are processed by GPT to generate responses or actions.
- **Configuration**: Settings like bot credentials, starting points, and API keys are in `config.js` and environment variables.

## Setup and Requirements

1. **Minecraft Server**:
   - Run a Minecraft Java Edition world (version 1.20.1 recommended).
   - Enable cheats and LAN mode for bot interaction.
   - Example: Create a peaceful world with seed 222, port 3001.

2. **Dependencies**:
   - Node.js (LTS version).
   - Install packages: `npm install` in the `src/` directory.

3. **Environment**:
   - Set API keys in a `.env` file (e.g., `OPENROUTER_API_KEY` or `OPENAI_API_KEY`).
   - Configure bot details in `config.js`.

## Running the Project

1. Navigate to `src/`: `cd aidev/projects/mc_agents/src`
2. Start the bot: `node main.js`
3. The bot spawns in the Minecraft world at the configured start point.

## Interacting with Agents

Interact via in-game chat commands, prefixed with `@botname` (e.g., if the bot is named "Bot1", use `@Bot1 command`).

### Command Types

- **Skill Commands** (prefixed with `/`):
  - `/gototree`: Move to the nearest tree.
  - `/harvesttree`: Harvest a tree (cuts and collects wood/logs).
  - `/spawn <botname>`: Spawn a new bot (only from the main bot).
  - `/create`: Create a GPT assistant for the bot.
  - `/reset`: Reset the bot's GPT assistant.
  - `/delete`: Delete the bot's GPT assistant.

- **Natural Language Commands**:
  - Any message without `/` is sent to GPT for processing.
  - Example: `@Bot1 find some wood` → GPT interprets and executes via skills.

### Tips for Interaction
- Bots respond in chat with status updates or GPT-generated replies.
- Use debug mode in Minecraft (`F3`) to monitor positions.
- Set daytime with `/time set day` for better visibility.
- Bots avoid dangers but may need manual intervention for complex scenarios.

## Project Structure

- `src/main.js`: Main bot creation and event handling.
- `src/skills.js`: Defines skill functions (e.g., `goToClosestTree`).
- `src/gpt.js`: GPT integration for AI commands.
- `src/config.js`: Bot and API configurations.
- `docs/`: Documentation, including custom GPT setups.

## Contributing

- Skills are built progressively: Start with simple functions, then compose complex ones.
- Use the custom GPT "MC Agents Tasker" (in `docs/custom_gpts/`) to generate development tasks.
- Ensure new skills call existing ones for modularity.

For issues or features, refer to the tasker GPT for guided development.