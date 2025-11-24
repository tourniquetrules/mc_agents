const path = require('path');
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '..', '.env');
require('dotenv').config({ path: rootEnvPath });

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('assistants keys:', Object.keys(openai.beta.assistants));
console.log('assistants prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(openai.beta.assistants)));

async function test() {
    try {
        const thread = await openai.beta.threads.create();
        console.log('Thread created:', thread);
        console.log('Thread ID:', thread.id);
        
        const assistant = await openai.beta.assistants.create({
            name: "test",
            model: "gpt-4o"
        });
        console.log('Assistant created:', assistant.id);

        const run = await openai.beta.threads.runs.create(
            thread.id, { assistant_id: assistant.id }
        );
        console.log('Run created:', run);
        console.log('Run ID:', run.id);

        await openai.beta.assistants.delete(assistant.id);
    } catch (e) {
        console.error(e);
    }
}

test();
