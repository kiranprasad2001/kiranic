import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { newsSchema } from './schema.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CONTENT_DIR = path.join(__dirname, '../src/content/slop');
const ICONS = ["Bot", "Terminal", "Cpu", "Sparkles", "AlertTriangle", "Cloud", "Server", "Database", "Code"];

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

// Recursively find recent markdown files
function getRecentHeadlines(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getRecentHeadlines(file));
        } else if (file.endsWith('.md')) {
            const content = fs.readFileSync(file, 'utf8');
            const match = content.match(/headline: "(.*)"/);
            if (match) results.push(match[1]);
        }
    });
    return results;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function callGeminiAPI(prompt, recentHeadlines) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    // Ensure we send a string, not an array
    const recentHeadlinesText = Array.isArray(recentHeadlines) ? recentHeadlines.slice(-10).join("\n") : "";

    const requestBody = {
        contents: [{
            parts: [{
                text: `${prompt}\n\nRecent headlines to avoid:\n${recentHeadlinesText}`
            }]
        }],
        generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Increased for longer articles
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
        return JSON.parse(text);
    } catch (e) {
        console.error("Full API Response:", JSON.stringify(data, null, 2));
        throw new Error("Failed to parse response");
    }
}

async function main() {
    try {
        console.log("Reading existing content...");
        const recentHeadlines = getRecentHeadlines(CONTENT_DIR);

        console.log("Generating new long-form content...");
        const prompt = `
            You are a satirical tech news generator for a blog called "News from the Latent Space". 
            Generate a funny, fictional news story about AI, LLMs, or Silicon Valley engineering culture.
            The tone should be cynical, witty, and absurdist but rooted in real tech terminology.
            
            CRITICAL REQUIREMENT: The content MUST be a long-form article (at least 800 words).
            It should include:
            - A catchy, clickbait headline.
            - A detailed summary.
            - Markdown formatted body text with:
                - Subheadings (##)
                - Fake quotes from industry experts.
                - Bullet points of "key takeaways" or "features".
                - A "Conclusion" or "Market Reaction" section.
            
            Make it sound like a deep investigative piece or a major product launch announcement.
        `;

        const newItem = await callGeminiAPI(prompt, recentHeadlines);

        // Metadata
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Allow overriding icon
        if (!ICONS.includes(newItem.icon)) {
            newItem.icon = "Bot";
        }

        console.log("New Item Generated:", newItem.headline);

        // Directory Structure: src/content/slop/[Year]/[Month]/
        const targetDir = path.join(CONTENT_DIR, year, month);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const slug = slugify(newItem.headline);
        const filePath = path.join(targetDir, `${slug}.md`);

        // Escape double quotes in summary/headline for YAML
        const safeHeadline = newItem.headline.replace(/"/g, '\\"');
        const safeSummary = newItem.summary.replace(/"/g, '\\"');

        const fileContent = `---
headline: "${safeHeadline}"
date: "${dateStr}"
summary: "${safeSummary}"
tags: ${JSON.stringify(newItem.tags)}
icon: "${newItem.icon}"
---

${newItem.content}
`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`Success! Slop generated at: ${filePath}`);

    } catch (error) {
        console.error("Failed to generate slop:", error);
        process.exit(1);
    }
}

main();
