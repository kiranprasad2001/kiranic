
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// ----------------------------------------------------
// TEST CONFIGURATION
// ----------------------------------------------------
const TEST_EMAIL_RECIPIENT = process.argv[2]; // Run with: node scripts/test-newsletter.js your@email.com

if (!TEST_EMAIL_RECIPIENT) {
    console.error('❌ Error: Please provide an email address.');
    console.error('Usage: node scripts/test-newsletter.js user@example.com');
    process.exit(1);
}
// ----------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLOP_DIR = path.join(__dirname, '../src/content/slop');
const RESEND_API_URL = 'https://api.resend.com/emails';

function getLatestArticles() {
    // Mock data for testing if no files exist, or read real files
    const today = new Date();
    // For testing, let's just pretend we found some articles if none exist, 
    // but try to read real ones first.

    // ... [Reuse logic from send-newsletter.js or import it if modularized] ...
    // To keep it simple and standalone, I'll copy the basic read logic but add a fallback mock.

    let recentArticles = [];

    if (fs.existsSync(SLOP_DIR)) {
        // Simple walk
        function walkDir(dir) {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    walkDir(filePath);
                } else if (file.endsWith('.md')) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const headlineMatch = content.match(/headline:\s*["']?([^"'\n]+)["']?/);
                    const summaryMatch = content.match(/summary:\s*["']?([^"'\n]+)["']?/);
                    const slug = path.basename(filePath, '.md');

                    // Extract Year and Month
                    const dirParts = filePath.split(path.sep);
                    const month = dirParts[dirParts.length - 2];
                    const year = dirParts[dirParts.length - 3];

                    recentArticles.push({
                        title: headlineMatch ? headlineMatch[1] : 'Test Article Title',
                        summary: summaryMatch ? summaryMatch[1] : 'This is a summary of the article.',
                        date: new Date(), // Just use now for test
                        url: `https://kiranic.com/ai-slop/${year}/${month}/${slug}/`
                    });
                }
            });
        }
        walkDir(SLOP_DIR);
    }

    if (recentArticles.length === 0) {
        console.log('⚠️ No local articles found. Using Mock Data.');
        recentArticles = [{
            title: "The AI That Refused to Open the Pod Bay Doors",
            summary: "An exclusive interview with a smart fridge that locked its owner out because they bought non-organic kale.",
            date: new Date(),
            url: "https://kiranic.com/ai-slop/pod-bay-doors"
        }];
    }

    return recentArticles.slice(0, 3); // Top 3
}

async function sendTestEmail(email, articles) {
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Missing RESEND_API_KEY in .env file.');
        return;
    }

    // ----------------------------------------------------
    // EMAIL TEMPLATE
    // ----------------------------------------------------
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
                                            <small style="color: #94a3b8; font-size: 12px;">📅 ${article.date.toLocaleDateString()}</small>
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
                                        You received this test email because you triggered it.
                                        <br>
                                        <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
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
    // ----------------------------------------------------

    console.log(`📧 Sending test email to ${email}...`);

    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'Kiranic AI <kp@news.kiranic.com>',
            to: email,
            subject: `[TEST] Weekly AI Slop: ${articles[0].title}`,
            html: htmlContent
        })
    });

    if (!response.ok) {
        console.error(`❌ Failed:`, await response.text());
    } else {
        const data = await response.json();
        console.log(`✅ Email sent successfully! ID: ${data.id}`);
    }
}

async function main() {
    console.log('🧪 Starting Newsletter Test...');
    const articles = getLatestArticles();
    await sendTestEmail(TEST_EMAIL_RECIPIENT, articles);
}

main();
