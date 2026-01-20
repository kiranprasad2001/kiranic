import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { newsSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE = path.join(__dirname, '../src/data/ai-slop.json');
const ICONS = ["Bot", "Terminal", "Cpu", "Sparkles", "AlertTriangle", "Cloud", "Server", "Database", "Code"];

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

async function callGeminiAPI(prompt, recentHeadlines) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Using fetch (Node 18+)
    const requestBody = {
        contents: [{
            parts: [{
                text: `${prompt}\n\nRecent headlines to avoid:\n${recentHeadlines}`
            }]
        }],
        generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            // Force JSON output
            response_mime_type: "application/json",
            response_schema: newsSchema
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    try {
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text); // Guaranteed to be valid JSON by the API
    } catch (e) {
        console.error("Full API Response:", JSON.stringify(data, null, 2));
        throw new Error("Failed to parse response");
    }
}

async function main() {
    try {
        console.log("Reading existing data...");
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const currentNews = JSON.parse(rawData);
        const recentHeadlines = currentNews.slice(0, 5).map(n => n.headline).join("\n");

        console.log("Generating new content...");
        const prompt = `
            You are a satirical tech news generator for a blog called "News from the Latent Space". 
            Generate a funny, fictional news story about AI, LLMs, or Silicon Valley engineering culture.
            The tone should be cynical, witty, and absurdist but rooted in real tech terminology.
            The content should be a full 3-paragraph news article using markdown formatting.
        `;

        const newItem = await callGeminiAPI(prompt, recentHeadlines);

        // Add metadata
        newItem.id = currentNews.length + 1;
        newItem.date = new Date().toISOString().split('T')[0];

        // Validate icon fallback
        if (!ICONS.includes(newItem.icon)) {
            newItem.icon = "Bot";
        }

        console.log("New Item Generated:", newItem.headline);

        currentNews.push(newItem);
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentNews, null, 4));
        console.log("Success! Slop generated.");

    } catch (error) {
        console.error("Failed to generate slop:", error);
        process.exit(1);
    }
}

main();
