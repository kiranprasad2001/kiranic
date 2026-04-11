import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const CONTENT_DIR = path.join(__dirname, '../src/content/slop');
const ICONS = ["Bot", "Terminal", "Cpu", "Sparkles", "AlertTriangle", "Cloud", "Server", "Database", "Code"];

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

// Recursively find recent headlines to avoid duplicates
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
        .replace(/-+$/, '')
        .substring(0, 80); // Cap slug length for sanity
}

async function callGeminiAPI(prompt, recentHeadlines) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const recentHeadlinesText = Array.isArray(recentHeadlines) ? recentHeadlines.slice(-15).join("\n") : "";

    const requestBody = {
        contents: [{
            parts: [{
                text: `${prompt}\n\nRecent headlines already covered (DO NOT repeat these topics):\n${recentHeadlinesText}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 8192
        },
        tools: [{
            google_search: {}
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    try {
        // Find the text part in the response (may be among multiple parts with grounding data)
        const parts = data.candidates[0].content.parts;
        const textPart = parts.find(p => p.text);
        if (!textPart) throw new Error("No text part in response");

        let text = textPart.text.trim();
        // Strip markdown code fences if the model wraps JSON in ```json ... ```
        // Use greedy match so content containing backticks doesn't break the outer fence match
        const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*)```\s*$/);
        if (fenceMatch) text = fenceMatch[1].trim();
        // Extract the JSON object by finding the outermost braces, handles any surrounding text
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd > jsonStart) text = text.slice(jsonStart, jsonEnd + 1);

        return JSON.parse(text);
    } catch (e) {
        console.error("Full API Response:", JSON.stringify(data, null, 2));
        throw new Error(`Failed to parse response: ${e.message}`);
    }
}

async function main() {
    try {
        console.log("Reading existing content to avoid duplicates...");
        const recentHeadlines = getRecentHeadlines(CONTENT_DIR);
        console.log(`Found ${recentHeadlines.length} existing articles.`);

        console.log("Generating today's AI & Tech digest...");
        const prompt = `
            You are a tech journalist writing a daily digest called "Signals from the Latent Space" 
            for a developer-focused audience. Your job is to research and summarize the most important 
            AI, machine learning, and tech developments from today or the past 24 hours.

            Use web search to find REAL, current stories. Do NOT fabricate or invent news.

            Generate a single digest article that covers 3-5 of the most significant stories. 
            The article should be:

            FORMAT:
            - A compelling headline that captures the day's theme (e.g., "OpenAI Ships GPT-5, 
              Google Responds with Gemini Ultra 2" or "Open Source LLMs Hit New Benchmarks 
              as Regulation Debate Heats Up")
            - A concise summary (2-3 sentences) for the email digest preview
            - Markdown-formatted body with:
                - Each story as a ## subheading
                - 2-3 paragraph summary per story explaining what happened and why it matters
                - A "**Why it matters:**" callout for each story
                - A final "## The Bottom Line" section with a 2-3 sentence synthesis

            TONE:
            - Professional but approachable — like a smart colleague explaining the news
            - Opinionated where appropriate — don't just summarize, analyze
            - Concise — respect the reader's time, aim for 600-900 words total
            - Use concrete details: numbers, names, dates

            CONTENT SCOPE:
            - Primary: AI/ML, LLMs, foundation models, AI regulation, AI products
            - Secondary: Cloud infrastructure, developer tools, open source, startups
            - Avoid: Crypto, gaming, consumer electronics (unless AI-related)

            TAGS: Use 3-5 specific topic tags (e.g., "LLMs", "OpenAI", "Open Source", "Regulation")

            SOURCES: Include the title and URL for each story's primary source. These should be 
            real, working URLs from reputable tech publications (TechCrunch, The Verge, Ars Technica, 
            VentureBeat, Hacker News, official blog posts, arXiv papers, etc.).

            ICON: Choose the most fitting icon for the digest's primary theme:
            - Bot: AI/chatbot news
            - Cpu: Hardware/chips/compute
            - Cloud: Cloud/infrastructure
            - Database: Data/training data
            - Terminal: Developer tools/coding
            - Code: Open source/programming
            - Sparkles: Product launches/new features
            - AlertTriangle: Security/regulation/warnings
            - Server: Infrastructure/scaling

            IMPORTANT: You MUST respond with ONLY a valid JSON object (no extra text, no markdown fences).
            Use this exact structure:
            {
                "headline": "Your headline here",
                "summary": "2-3 sentence summary",
                "content": "Full markdown body",
                "tags": ["Tag1", "Tag2"],
                "icon": "Bot",
                "sources": [{"title": "Source Title", "url": "https://..."}]
            }
        `;

        const newItem = await callGeminiAPI(prompt, recentHeadlines);

        // Metadata
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Validate icon
        if (!ICONS.includes(newItem.icon)) {
            newItem.icon = "Sparkles";
        }

        // Ensure sources array exists
        if (!Array.isArray(newItem.sources)) {
            newItem.sources = [];
        }

        console.log("Digest Generated:", newItem.headline);
        console.log(`  Stories: ${newItem.tags?.join(', ')}`);
        console.log(`  Sources: ${newItem.sources.length} linked`);

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

        // Build sources section to append to content
        let sourcesSection = '';
        if (newItem.sources.length > 0) {
            sourcesSection = '\n\n---\n\n## 📎 Sources\n\n';
            sourcesSection += newItem.sources.map(s => `- [${s.title}](${s.url})`).join('\n');
        }

        const fileContent = `---
headline: "${safeHeadline}"
date: "${dateStr}"
summary: "${safeSummary}"
tags: ${JSON.stringify(newItem.tags)}
icon: "${newItem.icon}"
---

${newItem.content}${sourcesSection}
`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`Success! Digest generated at: ${filePath}`);

    } catch (error) {
        console.error("Failed to generate digest:", error);
        process.exit(1);
    }
}

main();
