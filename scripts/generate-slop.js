import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
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

// Helper to make API calls using native Node.js https module (zero dependencies)
function callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(responseBody);
                        const text = parsed.candidates[0].content.parts[0].text;
                        resolve(text);
                    } catch (e) {
                        reject(new Error(`Failed to parse API response: ${e.message}`));
                    }
                } else {
                    reject(new Error(`API Error: ${res.statusCode} - ${responseBody}`));
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.write(data);
        req.end();
    });
}

async function main() {
    try {
        console.log("Reading existing data...");
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const currentNews = JSON.parse(rawData);

        // Get the last few headlines to provide context/avoid duplicates
        const recentHeadlines = currentNews.slice(0, 5).map(n => n.headline).join("\n");

        console.log("Generating new content...");
        const prompt = `
            You are a satirical tech news generator for a blog called "News from the Latent Space". 
            Generate a single JSON object representing a funny, fictional news story about AI, LLMs, or Silicon Valley engineering culture.
            The tone should be cynical, witty, and absurdist but rooted in real tech terminology.
            
            Format:
            {
                "headline": "Title of the story",
                "summary": "2-3 sentences max. Punchy and funny.",
                "content": "A full news article body (3 paragraphs). Use markdown formatting (e.g. **bold**, *italics*) where appropriate. No # headings.",
                "tags": ["Tag1", "Tag2"],
                "icon": "One of: Bot, Terminal, Cpu, Sparkles, AlertTriangle, Cloud, Server, Database, Code"
            }

            Recent stories (do not repeat themes too closely):
            ${recentHeadlines}

            IMPORTANT: Return ONLY the raw JSON object. No markdown formatting blocks around the JSON itself.
        `;

        const generatedText = await callGeminiAPI(prompt);
        console.log("DEBUG: Raw generated text from LLM:\n", generatedText);

        // Robust JSON extraction: find the first '{' and the last '}'
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from LLM response");
        }

        const cleanJson = jsonMatch[0];
        const newItem = JSON.parse(cleanJson);

        // Add metadata
        newItem.id = currentNews.length + 1;
        newItem.date = new Date().toISOString().split('T')[0];

        // Validate icon
        if (!ICONS.includes(newItem.icon)) {
            newItem.icon = "Bot"; // Fallback
        }

        console.log("New Item Generated:", newItem.headline);

        // Prepend to list (or append depending on sort logic, my component sorts by date so order in file doesn't strictly matter)
        // Let's just push to end
        currentNews.push(newItem);

        console.log("Writing to file...");
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentNews, null, 4));

        console.log("Success! Slop generated.");

    } catch (error) {
        console.error("Failed to generate slop:", error);
        process.exit(1);
    }
}

main();
