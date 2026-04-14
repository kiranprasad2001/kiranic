
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUBSTACK_COOKIE = process.env.SUBSTACK_COOKIE;
const SUBSTACK_DOMAIN = process.env.SUBSTACK_DOMAIN; // e.g., 'kiranic.substack.com'
const CONTENT_DIR = path.join(__dirname, '../src/content/slop');

if (!SUBSTACK_COOKIE || !SUBSTACK_DOMAIN) {
    console.warn("Skipping Substack publish: SUBSTACK_COOKIE or SUBSTACK_DOMAIN not set.");
    process.exit(0);
}

function getLatestFile(dir) {
    let latest = null;
    let latestMtime = 0;

    function search(directory) {
        if (!fs.existsSync(directory)) return;
        for (const file of fs.readdirSync(directory)) {
            const fullPath = path.join(directory, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                search(fullPath);
            } else if (file.endsWith('.md') && stat.mtimeMs > latestMtime) {
                latestMtime = stat.mtimeMs;
                latest = fullPath;
            }
        }
    }
    search(dir);
    return latest;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const fmText = match[1];
    const body = match[2];

    const headline = fmText.match(/headline: "(.*)"/)?.[1];
    const summary = fmText.match(/summary: "(.*)"/)?.[1];

    return { headline, summary, body };
}

async function main() {
    console.log("Starting Substack Publisher...");

    const latestFile = getLatestFile(CONTENT_DIR);
    if (!latestFile) {
        console.error("No content found to publish.");
        process.exit(1);
    }

    console.log(`Found latest article: ${path.basename(latestFile)}`);

    const rawContent = fs.readFileSync(latestFile, 'utf8');
    const article = parseFrontmatter(rawContent);
    if (!article) {
        console.error("Failed to parse article frontmatter.");
        process.exit(1);
    }

    const slug = path.basename(latestFile, '.md');
    const originalUrl = `https://kiranic.com/ai-slop/${slug}`;
    const footer = `\n\n---\n\n[Read the full formatted article on kiranic.com](${originalUrl})`;
    const bodyHtml = await marked.parse(article.body + footer);

    // Use Substack's API to create a draft
    const apiBase = `https://${SUBSTACK_DOMAIN}/api/v1`;

    try {
        const response = await fetch(`${apiBase}/drafts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `substack.sid=${SUBSTACK_COOKIE}`,
                'User-Agent': 'kiranic-publisher'
            },
            body: JSON.stringify({
                draft_title: article.headline,
                draft_subtitle: article.summary,
                draft_body: bodyHtml,
                type: 'newsletter',
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Substack API Error: ${response.status} - ${errorText}`);
        }

        const draft = await response.json();
        console.log(`Draft created successfully: ${draft.id}`);
        console.log(`Edit at: https://${SUBSTACK_DOMAIN}/publish/post/${draft.id}`);

    } catch (e) {
        console.error("Substack publish failed:", e.message);
        process.exit(1);
    }
}

main();
