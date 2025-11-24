// gpt.js located in ./

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { skillFunctions } = require('./skills.js');
const { sleep } = require('./utils.js');
const { GPT_MODEL, API_BASE_URL } = require('./config.js');

// Load root env so we can reuse existing secrets if present
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '..', '.env');
if (fs.existsSync(rootEnvPath)) {
    require('dotenv').config({ path: rootEnvPath });
}

let openai = null;
// Use OPENROUTER_API_KEY if available, otherwise fallback to OPENAI_API_KEY
let apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

// If using a local endpoint (LM Studio), default to a dummy key if none is provided
if (!apiKey && (API_BASE_URL.includes("192.168") || API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1"))) {
    apiKey = "lm-studio";
}

if (apiKey && apiKey.trim().length > 0) {
    openai = new OpenAI({ 
        apiKey: apiKey,
        baseURL: API_BASE_URL,
        defaultHeaders: {
            "HTTP-Referer": "https://github.com/ATLucas/aidev", // Optional, for including your app on openrouter.ai rankings.
            "X-Title": "Minecraft Agent", // Optional. Shows in rankings on openrouter.ai.
        }
    });
} else {
    console.warn('WARNING: API Key not set. GPT features will be disabled.');
}

async function createGPTAssistant(bot) {

    if (!openai) {
        console.log(`INFO: Skipping GPT creation for ${bot.username} (no API key configured)`);
        bot.conversationHistory = null;
        return;
    }

    console.log(`INFO: Initializing GPT conversation for ${bot.username}`);

    const instrPath = path.join(__dirname, 'gpt/instructions.md');
    const toolsPath = path.join(__dirname, 'gpt/tools.json');

    let instructions;
    let toolsData;
    
    try {
        instructions = fs.readFileSync(instrPath, 'utf8');
        const rawToolsData = fs.readFileSync(toolsPath, 'utf8');
        toolsData = JSON.parse(rawToolsData);
    } catch (error) {
        console.error('Error reading files:', error);
        return null;
    }
    
    // Store tools and system prompt in bot object for reuse
    bot.gptTools = toolsData["tools"];
    bot.conversationHistory = [
        { role: "system", content: instructions }
    ];
}

async function deleteGPTAssistant(bot) {
    // No server-side cleanup needed for Chat Completions
    bot.conversationHistory = null;
    console.log(`INFO: Cleared GPT history for ${bot.username}`);
}

async function performGPTCommand(bot, command) {

    if (!openai) {
        console.warn('GPT command requested but OpenAI is not configured.');
        return "I'm not connected to GPT right now.";
    }

    if (!bot.conversationHistory) {
        await createGPTAssistant(bot);
    }

    // Add user message to history
    bot.conversationHistory.push({ role: "user", content: command });

    let finalResponse = null;
    let keepLooping = true;
    let loopCount = 0;
    const MAX_LOOPS = 10; // Prevent infinite loops

    while (keepLooping && loopCount < MAX_LOOPS) {
        loopCount++;
        console.log(`DEBUG: GPT Loop ${loopCount}`);

        try {
            const completion = await openai.chat.completions.create({
                model: GPT_MODEL || "openai/gpt-4o-mini",
                messages: bot.conversationHistory,
                tools: bot.gptTools,
                tool_choice: "auto",
            });

            const message = completion.choices[0].message;
            
            // Add assistant's response to history
            bot.conversationHistory.push(message);

            if (message.tool_calls && message.tool_calls.length > 0) {
                console.log(`INFO: Model requested ${message.tool_calls.length} tool calls`);
                
                for (const toolCall of message.tool_calls) {
                    const funcName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    
                    if (!skillFunctions[funcName]) {
                        console.error(`ERROR: Function ${funcName} not found.`);
                        bot.conversationHistory.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({ error: `Function ${funcName} not found` })
                        });
                        continue;
                    }

                    console.log(`INFO: Calling ${funcName}(${JSON.stringify(args)})`);
                    let result;
                    try {
                        result = await skillFunctions[funcName](bot, ...Object.values(args));
                    } catch (err) {
                        result = { error: err.message };
                    }
                    
                    const resultJson = JSON.stringify(result);
                    console.log(`INFO: Result of ${funcName}: ${resultJson.substring(0, 100)}...`);

                    bot.conversationHistory.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: resultJson
                    });
                }
                // Loop again to let the model see the tool results
            } else {
                // No tool calls, we have a final text response
                finalResponse = message.content;
                keepLooping = false;
            }

        } catch (error) {
            console.error("GPT Error:", error);
            return "Sorry, I encountered an error processing that request.";
        }
    }

    if (loopCount >= MAX_LOOPS) {
        console.warn("WARNING: GPT loop limit reached.");
        return "I got stuck in a loop and couldn't finish the task.";
    }

    return finalResponse || "Done.";
}

module.exports = {
    createGPTAssistant,
    deleteGPTAssistant,
    performGPTCommand,
};
