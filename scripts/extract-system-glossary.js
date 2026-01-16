const fs = require('fs');
const path = require('path');

// Paths
const EN_PATH = path.join(__dirname, '../test/pf1systems/en.json');
const CN_PATH = path.join(__dirname, '../test/pf1systems/cn.json');
const OUTPUT_PATH = path.join(__dirname, '../src/renderer/src/data/glossaries/pathfinder1e.json');

// 1. Flatten JSON Helper
function flatten(obj, prefix = '') {
    let acc = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flatten(obj[key], prefix ? prefix + '.' + key : key));
        } else {
            acc[prefix ? prefix + '.' + key : key] = obj[key];
        }
    }
    return acc;
}

// 2. Intelligent Filter Logic
function shouldKeep(key, enValue) {
    // --- Phase 1: Explicit Exclusions (Fast Fail) ---

    // Skip Help texts, hints, descriptions, messages
    if (key.match(/(Desc|Hint|Msg|Message|Help|Title|Header|Label|Config|Dialog|Chat|Error|Warning|InfoBox)$/) &&
        !key.endsWith('Label')) { // Keep 'Label' only if it passes other checks (sometimes Label IS the term)
        return false;
    }
    if (key.includes('KEYBINDINGS') || key.includes('Sheet') || key.includes('LevelUp')) return false;

    // Value Checks
    if (!enValue || typeof enValue !== 'string') return false;
    if (enValue.trim() === '') return false;
    if (enValue.length > 40) return false; // Too long = description
    if (enValue.includes('<') || enValue.includes('>')) return false; // HTML
    if (enValue.includes('{') || enValue.includes('}')) return false; // Variables (e.g. {value} gp)

    // Skip "Misc" or "Other" unless they are specific
    if (enValue === 'Miscellaneous' || enValue === 'Other' || enValue === 'General') return false;

    // --- Phase 2: Category Allowlists (Strict Match) ---

    // 1. Skill Names (e.g. PF1.SkillAcr)
    // Regex: PF1.Skill[CODE]
    if (/^PF1\.Skill[A-Za-z]+$/.test(key)) return true;

    // 2. Conditions (e.g. PF1.Condition.blind)
    if (/^PF1\.Condition\.[a-z]+$/.test(key)) return true;

    // 3. Abilities (PF1.AbilityStr, PF1.AbilityStrMod)
    if (/^PF1\.Ability(Short)?[A-Z][a-z]+(Mod|Pen)?$/.test(key)) return true;

    // 4. Saving Throws
    if (/^PF1\.SavingThrow[A-Z][a-z]+$/.test(key)) return true;

    // 5. Alignments (PF1.Alignments.lg)
    if (/^PF1\.Alignments\.([a-z]{1,2}|Short\.[a-z]{1,2})$/.test(key)) return true;

    // 6. Weapon Groups / Types / Properties
    if (/^PF1\.WeaponGroup\.[a-z]+$/.test(key)) return true;
    if (/^PF1\.WeaponType[A-Z][a-z]+$/.test(key)) return true;
    if (/^PF1\.WeaponProperty\.[A-Z][a-z]+$/.test(key)) return true;

    // 7. Action Types (PF1.ActionTypes.mwak)
    if (/^PF1\.ActionTypes\.[a-z]+$/.test(key)) return true;

    // 8. Senses
    if (/^PF1\.Sense\.[a-z]+$/.test(key)) return true;

    // 9. Ammo Types
    if (/^PF1\.AmmoType\.([a-z]+|[a-z]+[A-Z][a-z]+)$/.test(key)) return true;

    // 10. Distance Units (feet, meters)
    if (/^PF1\.Distance\.[a-z]+(Short)?$/.test(key)) return true;

    // 11. Core Subtypes (The Gold Mine for Nouns)
    // Pattern: PF1.Subtypes.[Category].[Type].[...].Single (Singular Noun)
    // Example: PF1.Subtypes.Item.equipment.armor.Single -> "Armor"
    if (key.includes('.Subtypes.') && key.endsWith('.Single')) {
        return true;
    }

    // 12. Damage Alignment (PF1.DamageAlignment.Override) - maybe useful?
    // Skip for now, usually "Override" / "Inherit" which are mechanic terms not glossary terms.

    // 13. Buff Targets (PF1.BuffTarAC) -> "AC", "Armor AC"
    if (/^PF1\.BuffTar[A-Za-z]+$/.test(key)) return true;

    return false;
}

async function main() {
    console.log('📦 Loading JSON files...');

    if (!fs.existsSync(EN_PATH) || !fs.existsSync(CN_PATH)) {
        console.error('❌ Source files not found in test/pf1systems/');
        process.exit(1);
    }

    const enRaw = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));
    const cnRaw = JSON.parse(fs.readFileSync(CN_PATH, 'utf-8'));

    console.log('🔄 Flattening structure...');
    const enFlat = flatten(enRaw);
    const cnFlat = flatten(cnRaw);

    console.log(`- English Keys: ${Object.keys(enFlat).length}`);
    console.log(`- Chinese Keys: ${Object.keys(cnFlat).length}`);

    console.log('🔍 Filtering and Matching...');

    const glossary = {};
    let count = 0;

    for (const key in enFlat) {
        const enVal = enFlat[key];
        const cnVal = cnFlat[key];

        // Must exist in both
        if (!cnVal) continue;

        // Apply Logic
        if (shouldKeep(key, enVal)) {
            // Filter out untranslated terms (English == Chinese)
            // effective for "Tribal", "Alchemical Remedy"
            // But keep short acronyms like "AC", "HP", "LG", "CE"
            if (enVal === cnVal && enVal.length > 4) {
                continue;
            }

            // Clean up values?
            // e.g. "Armor" is good.
            // "Light Shield" is good.

            // Avoid duplicates (if multiple keys map to same English term)
            // But here our Key is the English term for the glossary JSON
            // So: "Armor": "盔甲"

            // Check for conflict
            if (glossary[enVal]) {
                if (glossary[enVal] !== cnVal) {
                    // Conflict found. Prefer the longer/more specific one? Or just log it.
                    // Usually if "Armor" maps to "盔甲" in one place and "护甲" in another.
                    // For glossary, consistency is key. We'll skip if already set?
                    // Or overwrite?
                    // Let's validation:
                    // console.warn(`Conflict for "${enVal}": "${glossary[enVal]}" vs "${cnVal}" (${key})`);
                }
            }

            glossary[enVal] = cnVal;
            count++;
        }
    }

    // Manual Additions / Fixes (Curated Logic)
    // Add specific high-value terms that might have been missed or filter logic excluded
    // (None for now, trust the logic)

    console.log(`✅ Extracted ${Object.keys(glossary).length} terms.`);

    // Sort Keys
    const sortedGlossary = {};
    Object.keys(glossary).sort().forEach(key => {
        sortedGlossary[key] = glossary[key];
    });

    console.log(`💾 Writing to ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sortedGlossary, null, 2), 'utf-8');
    console.log('🎉 Done!');
}

main();
