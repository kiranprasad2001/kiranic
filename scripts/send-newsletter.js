
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

    if (!subscriber.token) {
        console.warn(`⚠️ Subscriber ${subscriber.email} missing token. Skipping.`);
        return;
    }

    const unsubscribeUrl = `https://kiranic.com/unsubscribe?token=${subscriber.token}`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                a { color: #2563eb; text-decoration: none; }
                /* Mobile tweaks */
                @media only screen and (max-width: 600px) {
                    .container { width: 100% !important; padding: 10px !important; }
                    .nav-link { display: block !important; padding: 5px 0 !important; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <!-- HEADER -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <!-- BRANDING & NAV -->
                            <tr>
                                <td style="padding: 24px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                                    <a href="https://kiranic.com" style="font-size: 24px; font-weight: bold; color: #0f172a; text-decoration: none;">
                                        <span style="color: #2563eb;">Kiran</span> Prasad
                                    </a>
                                    <div style="margin-top: 16px;">
                                        <a href="https://kiranic.com" style="color: #64748b; margin: 0 10px; font-size: 14px; font-weight: 500;">Home</a>
                                        <a href="https://kiranic.com/work" style="color: #64748b; margin: 0 10px; font-size: 14px; font-weight: 500;">Work</a>
                                        <a href="https://kiranic.com/lab" style="color: #64748b; margin: 0 10px; font-size: 14px; font-weight: 500;">Lab</a>
                                        <a href="https://kiranic.com/life" style="color: #64748b; margin: 0 10px; font-size: 14px; font-weight: 500;">Life</a>
                                        <a href="https://kiranic.com/ai-slop" style="color: #64748b; margin: 0 10px; font-size: 14px; font-weight: 500;">AI Slop</a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- INTRO -->
                            <tr>
                                <td style="padding: 30px 24px 10px 24px; text-align: center;">
                                    <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 8px 0;">Weekly Hallucinations 🤖</h1>
                                    <p style="color: #64748b; margin: 0; font-size: 16px;">Fresh slop from the neural network.</p>
                                </td>
                            </tr>

                            <!-- CONTENT -->
                            <tr>
                                <td style="padding: 24px;">
                                    ${articles.map(article => `
                                        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
                                            <h2 style="margin: 0 0 8px 0; font-size: 18px;">
                                                <a href="${article.url}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${article.title}</a>
                                            </h2>
                                            <p style="color: #334155; line-height: 1.6; margin: 0 0 12px 0;">${article.summary}</p>
                                            <small style="color: #94a3b8; font-size: 12px;">📅 ${article.date.toISOString().split('T')[0]}</small>
                                        </div>
                                    `).join('')}
                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td style="background-color: #f1f5f9; padding: 24px; text-align: center;">
                                    <div style="margin-bottom: 16px;">
                                        <a href="https://github.com/kiranprasad2001" style="color: #64748b; margin: 0 8px; font-size: 13px;">GitHub</a>
                                        <a href="https://linkedin.com/in/kiranprasad2001" style="color: #64748b; margin: 0 8px; font-size: 13px;">LinkedIn</a>
                                        <a href="https://bsky.app/profile/kiranic.com" style="color: #64748b; margin: 0 8px; font-size: 13px;">Bluesky</a>
                                        <a href="mailto:kp@kiranic.com" style="color: #64748b; margin: 0 8px; font-size: 13px;">Email</a>
                                        <a href="https://kiranic.com/rss.xml" style="color: #64748b; margin: 0 8px; font-size: 13px;">RSS</a>
                                    </div>
                                    <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
                                        &copy; ${new Date().getFullYear()} Kiran Prasad. Architecting Documents & Cloud Systems.
                                    </p>
                                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                                        <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> from these hallucinations.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
