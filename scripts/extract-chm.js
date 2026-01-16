const fs = require('fs');
const path = require('path');

const INPUT_DIR = String.raw`d:\fvtt-translator\test\pf1_out`;
const OUTPUT_FILE = String.raw`d:\fvtt-translator\src\renderer\src\data\glossaries\pathfinder1e.json`;

console.log(`Scanning directory: ${INPUT_DIR}`);

let fileCount = 0;
let matchCount = 0;
const termMap = new Map();

// Regex Patterns
// 1. English (Chinese) - e.g. "Fireball (火球术)"
const REGEX_ENG_CHN = /([A-Za-z][A-Za-z0-9\s'+\-]{2,60})\s*[（(]\s*([\u4e00-\u9fa5]+[\u4e00-\u9fa5\uff0c\u3001\s]*?)\s*[)）]/g;
// 2. Chinese (English) - e.g. "火球术 (Fireball)"
const REGEX_CHN_ENG = /([\u4e00-\u9fa5]+[\u4e00-\u9fa5\uff0c\u3001\s]*?)\s*[（(]\s*([A-Za-z][A-Za-z0-9\s'+\-]{2,60})\s*[)）]/g;

// GBK Decoder
const decoder = new TextDecoder('gbk');

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.htm') || file.endsWith('.html')) {
            fileCount++;
            // Read as buffer, decode as GBK
            const buffer = fs.readFileSync(fullPath);
            const content = decoder.decode(buffer);
            extractTerms(content);
        }
    }
}

function extractTerms(content) {
    let match;

    // Pattern 1: Eng (Chn)
    while ((match = REGEX_ENG_CHN.exec(content)) !== null) {
        let eng = match[1].trim();
        let chn = match[2].trim();
        addTerm(eng, chn);
    }

    // Pattern 2: Chn (Eng)
    while ((match = REGEX_CHN_ENG.exec(content)) !== null) {
        let eng = match[2].trim();
        let chn = match[1].trim();
        addTerm(eng, chn);
    }
}

function addTerm(eng, chn) {
    // Basic cleaning
    eng = eng.replace(/<[^>]+>/g, '').trim(); // Remove tags if regex caught them
    chn = chn.replace(/<[^>]+>/g, '').trim();

    if (eng.length < 2 || !isNaN(eng)) return;
    if (chn.length < 1) return;
    if (eng.includes("Check") || eng.includes("Level") || eng.includes("School")) return; // Common false positives

    if (!termMap.has(eng)) {
        termMap.set(eng, chn);
        matchCount++;
    }
}

try {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`Input directory not found: ${INPUT_DIR}`);
        process.exit(1);
    }

    // Ensure output dir exists
    const outDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    scanDir(INPUT_DIR);

    console.log(`Scanned ${fileCount} files.`);
    console.log(`Extracted ${matchCount} terms.`);

    // Sort keys
    const sortedObj = {};
    Array.from(termMap.keys()).sort().forEach(key => {
        sortedObj[key] = termMap.get(key);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedObj, null, 2), 'utf-8');
    console.log(`Glossary saved to ${OUTPUT_FILE}`);

} catch (err) {
    console.error("Extraction failed:", err);
}
