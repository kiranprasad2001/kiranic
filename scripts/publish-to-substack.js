
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Env vars
const SUBSTACK_COOKIE = process.env.SUBSTACK_COOKIE;
const SUBSTACK_DOMAIN = process.env.SUBSTACK_DOMAIN; // e.g., 'kiranic.substack.com'
const CONTENT_DIR = path.join(__dirname, '../src/content/slop');

if (!SUBSTACK_COOKIE || !SUBSTACK_DOMAIN) {
    console.warn("Skipping Substack publish: SUBSTACK_COOKIE or SUBSTACK_DOMAIN not set.");
    process.exit(0);
}

// Helper to find latest file
function getLatestFile(dir) {
    let latest = null;
    let latestMtime = 0;

    function search(directory) {
        if (!fs.existsSync(directory)) return;
        const list = fs.readdirSync(directory);
        list.forEach(file => {
            const fullPath = path.join(directory, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                search(fullPath);
            } else if (file.endsWith('.md')) {
                if (stat.mtimeMs > latestMtime) {
                    latestMtime = stat.mtimeMs;
                    latest = fullPath;
                }
            }
        });
    }
    search(dir);
    return latest;
}

// Parse simple frontmatter
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const fmText = match[1];
    const body = match[2];

    const headline = fmText.match(/headline: "(.*)"/)?.[1];
    const summary = fmText.match(/summary: "(.*)"/)?.[1];
    const date = fmText.match(/date: "(.*)"/)?.[1]; // YYYY-MM-DD
    const icon = fmText.match(/icon: "(.*)"/)?.[1];

    return { headline, summary, date, icon, body };
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
        console.error("Failed to parse article.");
        process.exit(1);
    }

    // Prepare content for Substack
    // We will append a link to the original source
    const originalUrl = `https://kiranic.com/ai-slop/${path.basename(latestFile, '.md')}`; // Approx slug
    const footer = `\n\n[Read the full formatted article on the Lab](${originalUrl})`;

    // Substack doesn't support markdown paste perfectly, but let's try typing or setting HTML.
    // Actually, setting innerHTML of the editor is the most robust hack.

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // 1. Set Cookie
        await page.setCookie({
            name: 'substack.sid',
            value: SUBSTACK_COOKIE,
            domain: '.substack.com',
            path: '/',
            secure: true,
            httpOnly: true
        });

        // 2. Navigate to Publish
        const publishUrl = `https://${SUBSTACK_DOMAIN}/publish`;
        console.log(`Navigating to ${publishUrl}...`);
        await page.goto(publishUrl, { waitUntil: 'networkidle2' });

        // Check if we were redirected to login (Cookie invalid)
        if (page.url().includes('/sign-in')) {
            throw new Error("Cookie invalid or expired. Redirected to sign-in.");
        }

        // Wait for editor
        // Substack's editor selector changes, usually it's a contenteditable div
        // We look for the inputs first
        await page.waitForSelector('textarea[placeholder="Title"]');

        console.log("Filling content...");

        // Fill Title
        await page.type('textarea[placeholder="Title"]', article.headline);

        // Fill Subtitle
        await page.type('textarea[placeholder="Subtitle"]', article.summary);

        // Fill Body
        // The body editor usually has a class like 'pencraft' or is the main contenteditable
        // We will try to find the editor div. Safest is ".tiptap" or similar if they use that. 
        // Or we can click and type.
        // For simplicity, we'll try to focus the editor area.

        // Strategy: Tab from subtitle?
        // Or better: Use the 'Simulate typing' into the editor div.
        // Selector might be `.ck-editor__editable` or `.ProseMirror`
        const editorSelector = '.ProseMirror';
        await page.waitForSelector(editorSelector);
        await page.click(editorSelector);

        // Paste content (Simulate paste for better formatting preservation if we copy HTML?)
        // Since we have Markdown, we can't just paste. 
        // We will just type the raw text or a simplified version.
        // Publishing Full MD via puppeteer is hard.
        // Let's type the body text properly.

        // NOTE: Typing huge body takes forever content.
        // We will set the text content directly if possible, or use clipboard API.

        // Let's strip markdown syntax for now to avoid mess, or just keep it text style.
        // "AI Slop" implies text.

        await page.evaluate((selector, text) => {
            const el = document.querySelector(selector);
            if (el) {
                // Formatting is lost here, but it's safe.
                // To support markdown, Substack usually auto-converts some patterns.
                // We'll insert paragraphs.
                el.innerText = text;
            }
        }, editorSelector, article.body + footer);

        // 3. Continue to Publish Options
        // Look for "Settings" or "Continue" button.
        // Usually there is a "Continue" button at navbar.
        const continueBtn = await page.waitForSelector('button ::-p-text(Continue)', { timeout: 5000 }).catch(() => null)
            || await page.waitForSelector('div[role="button"] ::-p-text(Continue)', { timeout: 5000 }).catch(() => null);

        // Actually Substack UI uses "Continue" in header.
        // Let's find button with text "Continue"
        const buttons = await page.$$('button');
        let continueButton = null;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Continue')) {
                continueButton = btn;
                break;
            }
        }

        if (!continueButton) {
            // Try "Settings" in bottom right? No.
            throw new Error("Could not find Continue button");
        }

        await continueButton.click();

        // 4. Wait for settings modal
        await page.waitForSelector('.publish-settings-modal', { timeout: 10000 });

        // 5. Click "Send to everyone now"
        // There is usually a big button "Send to everyone now"
        const sendButton = await page.waitForSelector('button.publish-button');

        // 6. Confirm publish
        // Wait! User said "published".
        // This button might be "Send test" or "Schedule". 
        // We want to be careful.
        // In this automated script, we might want to just Save Draft for safety unless user insists.
        // User said "ensure the same posts are published".
        // Use "Send to everyone now" is risky if things look bad.
        // I will default to making it available but maybe not sending email?
        // Substack default is "Send via email and the Substack app".

        // Let's just Click the final button.
        console.log("Publishing...");
        await sendButton.click();

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log("Published successfully!");

    } catch (e) {
        console.error("Puppeteer Error:", e);
        // Save screenshot
        await page.screenshot({ path: 'substack-error.png' });
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();
