import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glossarySchema } from './schema.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE = path.join(__dirname, '../src/data/glossary.json');

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

async function callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            response_mime_type: "application/json",
            response_schema: glossarySchema
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
        console.log("Reading existing data...");
        let currentTerms = [];
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            currentTerms = JSON.parse(rawData);
        }

        const existingKeys = new Set(currentTerms.map(t => t.term.toLowerCase()));

        console.log(`Found ${currentTerms.length} existing terms.`);
        console.log("Generating new glossary terms...");

        const prompt = `
            You are an expert Enterprise Architect specializing in Customer Communication Management (CCM) and Digital Experience (DXP).
            
            Generate a list of 45 high-value technical glossary terms and definitions related to:
            - Quadient Inspire (Scaler, Interactive, Designer)
            - SmartCommunications (SmartComms, SC Scaler)
            - Enterprise Content Management (ECM)
            - Digital Transformation & Cloud Migration (AWS, Azure, Docker)
            
            The definitions should be professional, technical, and optimized for SEO.
            Do NOT duplicate these existing terms: ${Array.from(existingKeys).join(', ')}.
            
            Return a JSON object with a "terms" array.
        `;

        const result = await callGeminiAPI(prompt);
        const newTerms = result.terms;

        console.log(`Generated ${newTerms.length} new terms.`);

        let addedCount = 0;
        for (const item of newTerms) {
            if (!existingKeys.has(item.term.toLowerCase())) {
                currentTerms.push(item);
                existingKeys.add(item.term.toLowerCase());
                addedCount++;
            }
        }

        // Sort alphabetically
        currentTerms.sort((a, b) => a.term.localeCompare(b.term));

        fs.writeFileSync(DATA_FILE, JSON.stringify(currentTerms, null, 4));
        console.log(`Success! Added ${addedCount} new terms. Total glossary size: ${currentTerms.length}`);

    } catch (error) {
        console.error("Failed to generate glossary:", error);
        process.exit(1);
    }
}

main();
