# Stream Deck Integration for Minecraft Bot

The bot now includes an HTTP API server running on **port 3002** that allows you to control it from external applications like Elgato Stream Deck.

**Bot Server IP**: `192.168.2.180`  
**Stream Deck / Minecraft PC**: `192.168.2.64`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Get bot health, food, and position |
| `/command` | POST | Execute a skill command |
| `/ai` | POST | Send natural language command to GPT |
| `/commands` | GET | List all available commands |

## Stream Deck Setup

### Required Plugin
Install the **"API Ninja"** or **"Super Macro"** plugin from the Stream Deck store. Alternatively, use the built-in **"Website"** action for simple GET requests.

### Example Button Configurations

#### 1. "Come to Me" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{"command": "come"}
```

#### 2. "Follow Me" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Body**:
```json
{"command": "follow", "args": ["TourniquetRules"]}
```

#### 3. "Stop" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Body**:
```json
{"command": "stop"}
```

#### 4. "Harvest Tree" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Body**:
```json
{"command": "harvestTree"}
```

#### 5. "Check Inventory" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Body**:
```json
{"command": "queryInventory"}
```

#### 6. "Check Status" Button (Health/Food)
- **Action**: API Ninja → GET Request
- **URL**: `http://192.168.2.180:3002/status`

#### 7. "AI Command" Button (Natural Language)
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/ai`
- **Body**:
```json
{"message": "find and mine some stone"}
```

#### 8. "Chat in Game" Button
- **Action**: API Ninja → POST Request
- **URL**: `http://192.168.2.180:3002/command`
- **Body**:
```json
{"command": "chat", "args": ["Hello everyone!"]}
```

## Testing with curl

You can test the API from the bot server (192.168.2.180):

```bash
# Get bot status
curl http://localhost:3002/status

# Execute a skill
curl -X POST http://localhost:3002/command \
  -H "Content-Type: application/json" \
  -d '{"command": "come"}'

# Send AI command
curl -X POST http://localhost:3002/ai \
  -H "Content-Type: application/json" \
  -d '{"message": "what is in your inventory"}'

# List available commands
curl http://localhost:3002/commands
```

Or from the Minecraft PC (192.168.2.64):

```bash
# Get bot status
curl http://192.168.2.180:3002/status

# Execute a skill
curl -X POST http://192.168.2.180:3002/command \
  -H "Content-Type: application/json" \
  -d '{"command": "come"}'
```

## Available Skill Commands

Run `curl http://localhost:3002/commands` to see all available skills. Common ones include:

- `come` - Come to player
- `follow` - Follow a player (args: ["playerName"])
- `stop` - Stop current action
- `harvestTree` - Find and harvest nearest tree
- `queryInventory` - Check inventory
- `storeInventory` - Store items in nearest chest
- `collectItems` - Collect specific items (args: ["itemName"])
- `craftItem` - Craft an item (args: ["itemName", count])
- `equipItem` - Equip an item (args: ["itemName", "destination"])
- `move` - Move in direction (args: ["forward/back/left/right", distance])
- `lookAt` - Look at player (args: ["username"])
- `fight` - Fight a mob type (args: ["mobType"])
- `eat` - Eat food if hungry

## Response Format

All responses are JSON:

```json
{
  "success": true,
  "command": "come",
  "result": {"success": true, "message": "Arrived at player."}
}
```

Or on error:
```json
{
  "success": false,
  "error": "Bot not found"
}
```

## Multiple Bots

If you have multiple bots, specify which one with the `bot` parameter:

```json
{"command": "come", "bot": "Luddite"}
```

## Troubleshooting

1. **Connection refused**: Make sure the bot service is running (`sudo systemctl status minecraftbot.service`)
2. **Bot not found**: The bot may not have spawned yet. Wait a few seconds after starting.
3. **Command failed**: Check the bot logs at `src/bot.log` for details.
