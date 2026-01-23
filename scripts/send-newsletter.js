
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLOP_DIR = path.join(__dirname, '../src/content/slop');

// Resend API (Set RESEND_API_KEY in environment)
const RESEND_API_URL = 'https://api.resend.com/emails';

// Cloudflare D1 API (via Cloudflare API)
// We need ACCOUNT_ID, D1_DATABASE_ID, CLOUDFLARE_API_TOKEN
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_DB_ID = 'be6946fb-dd0b-46c1-825c-784932a6e9bd'; // From previous step
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

async function getSubscribers() {
    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
        throw new Error('Missing Cloudflare credentials');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DB_ID}/query`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sql: "SELECT email, token FROM subscribers"
        })
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(`D1 Query Failed: ${JSON.stringify(data.errors)}`);
    }

    return data.result[0].results; // Array of { email, token }
}

function getLatestArticles() {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recursive search or flattening logic based on existing structure (Year/Month)
    // Simplified: assuming we can walk basic directories or just check recent files if flat,
    // but the project structure is src/content/slop/[Year]/[Month]/[slug].md

    let recentArticles = [];

    // Helper to walk directories
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.md')) {
                // Read frontmatter to check date
                const content = fs.readFileSync(filePath, 'utf-8');
                const dateMatch = content.match(/date:\s*["']?([^"'\n]+)["']?/);
                if (dateMatch) {
                    const articleDate = new Date(dateMatch[1]);
                    if (articleDate >= oneWeekAgo && articleDate <= today) {
                        // Extract other frontmatter
                        const headlineMatch = content.match(/headline:\s*["']?([^"'\n]+)["']?/);
                        const summaryMatch = content.match(/summary:\s*["']?([^"'\n]+)["']?/);
                        const slug = path.basename(filePath, '.md');

                        // Construct public URL (approximation, verified against logic)
                        // Actually need accurate permalink. 
                        // Assuming /ai-slop/[slug] based on pages logic.

                        // Extract Year and Month from path (assumes src/content/slop/[Year]/[Month]/[slug].md)
                        const dirParts = filePath.split(path.sep); // Use OS header
                        const month = dirParts[dirParts.length - 2];
                        const year = dirParts[dirParts.length - 3];

                        recentArticles.push({
                            title: headlineMatch ? headlineMatch[1] : 'Unknown Title',
                            summary: summaryMatch ? summaryMatch[1] : '',
                            date: articleDate,
                            url: `https://kiranic.com/ai-slop/${year}/${month}/${slug}/`
                        });
                    }
                }
            }
        });
    }

    if (fs.existsSync(SLOP_DIR)) {
        walkDir(SLOP_DIR);
    }

    return recentArticles.sort((a, b) => b.date - a.date);
}

async function sendEmail(subscriber, articles) {
    if (!process.env.RESEND_API_KEY) {
        console.log('Skipping email (no key):', subscriber.email);
        return;
    }

    const unsubscribeUrl = `https://kiranic.com/unsubscribe?token=${subscriber.token}`;

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">Weekly Hallucinations 🤖</h1>
            <p>Here's what the AI cooked up this week on <a href="https://kiranic.com">kiranic.com</a>.</p>
            
            ${articles.map(article => `
                <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="margin-top: 0;"><a href="${article.url}" style="color: #2563eb; text-decoration: none;">${article.title}</a></h2>
                    <p style="color: #475569;">${article.summary}</p>
                    <small style="color: #94a3b8;">${article.date.toISOString().split('T')[0]}</small>
                </div>
            `).join('')}

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                You are receiving this because you subscribed at kiranic.com.
                <br>
                <a href="${unsubscribeUrl}" style="color: #64748b;">Unsubscribe</a>
            </p>
        </div>
    `;

    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'Kiranic AI <kp@news.kiranic.com>',
            to: subscriber.email,
            subject: `Weekly AI Slop: ${articles[0].title}`,
            html: htmlContent
        })
    });

    if (!response.ok) {
        console.error(`Failed to send to ${subscriber.email}:`, await response.text());
    } else {
        console.log(`Sent to ${subscriber.email}`);
    }
}

async function main() {
    console.log('Starting Weekly Newsletter Job...');

    // 1. Get Articles
    const articles = getLatestArticles();
    if (articles.length === 0) {
        console.log('No new articles this week. Skipping newsletter.');
        return;
    }
    console.log(`Found ${articles.length} new articles.`);

    // 2. Get Subscribers
    try {
        const subscribers = await getSubscribers();
        console.log(`Found ${subscribers.length} subscribers.`);

        // 3. Send Emails
        for (const sub of subscribers) {
            await sendEmail(sub, articles);
        }
    } catch (e) {
        console.error('Failed to process newsletter:', e);
        process.exit(1);
    }
}

main();
