
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// ------------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------------
const INPUT_FILE = 'emails.txt';
const OUTPUT_FILE = 'migrations/import_subscribers.sql';
// ------------------------------------------------------------------

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.join(__dirname, '..');
const inputPath = path.join(projectRoot, INPUT_FILE);
const outputPath = path.join(projectRoot, OUTPUT_FILE);

console.log(`🔍 Looking for ${INPUT_FILE}...`);

if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Could not find '${INPUT_FILE}'.`);
    console.log(`\n👉 Action Required:`);
    console.log(`   Create a file named '${INPUT_FILE}' in the root folder.`);
    console.log(`   Paste your emails there (one per line).`);
    process.exit(1);
}

const content = fs.readFileSync(inputPath, 'utf-8');
const emails = content
    .split('\n')
    .map(e => e.trim())
    .filter(e => e.length > 0 && e.includes('@')); // Basic validation

if (emails.length === 0) {
    console.error('❌ No valid emails found in the file.');
    process.exit(1);
}

console.log(`✅ Found ${emails.length} valid emails.`);

// Generate SQL
// We use "INSERT OR IGNORE" to skip duplicates without crashing
let sql = `INSERT OR IGNORE INTO subscribers (email, token, created_at) VALUES\n`;

const values = emails.map((email, index) => {
    const token = randomUUID();
    const date = new Date().toISOString();
    const isLast = index === emails.length - 1;
    return `('${email.replace(/'/g, "''")}', '${token}', '${date}')${isLast ? ';' : ','}`;
});

sql += values.join('\n');

// Write SQL file
fs.writeFileSync(outputPath, sql);

console.log(`\n🎉 Success! SQL file generated at: key '${OUTPUT_FILE}'`);
console.log(`\n🚀 TO IMPORT THESE SUBSCRIBERS, RUN:`);
console.log(`   npx wrangler d1 execute kiranic-db --remote --file=${OUTPUT_FILE}`);
console.log(`\n(Or remove --remote to test locally first)`);
