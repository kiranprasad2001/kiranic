
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
    // EMAIL TEMPLATE (Edit this to change design!)
    // ----------------------------------------------------
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #0f172a; margin-bottom: 5px;">Weekly Hallucinations 🤖</h1>
                <p style="color: #64748b; margin-top: 0;">Straight from the neural network.</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                ${articles.map(article => `
                    <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="margin-top: 0; font-size: 18px;">
                            <a href="${article.url}" style="color: #2563eb; text-decoration: none;">${article.title}</a>
                        </h2>
                        <p style="color: #334155; line-height: 1.6;">${article.summary}</p>
                        <small style="color: #94a3b8; font-size: 12px;">📅 ${article.date.toLocaleDateString()}</small>
                    </div>
                `).join('')}
            </div>

            <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
                <p>You received this test email because you trigger it.</p>
                <a href="#" style="color: #64748b;">Unsubscribe</a>
            </div>
        </div>
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
