
const isTranslatable = (str) => {
    const trimmed = str.trim()
    if (trimmed.length < 2) return "FAIL_LENGTH"

    if (trimmed.match(/^[@#$!{_]/)) return "FAIL_START_CHAR"
    if (trimmed.includes('/') && !trimmed.includes(' ')) return "FAIL_PATH"
    if (trimmed.includes('.') && !trimmed.includes(' ')) return "FAIL_DOT_KEY"
    if (!trimmed.match(/[a-zA-Z\u4e00-\u9fa5]/)) return "FAIL_NO_LETTERS"

    if (!trimmed.includes(' ')) {
        if (trimmed.match(/^[a-z][a-zA-Z0-9_.-]*$/)) return "FAIL_CODE_ID"
        if (trimmed.match(/^[A-Z0-9_]+$/)) return "FAIL_CONST"
    }

    const strippedHtml = trimmed.replace(/<[^>]+>/g, '').trim()
    if (trimmed.includes('<') && trimmed.includes('>') && strippedHtml.length === 0) {
        return "FAIL_HTML_ONLY"
    }

    return "PASS"
}

const samples = [
    "spell",
    "feat",
    "PF1.AmmoDepleted",
    "<i class=\"fas fa-check\"></i>",
    "PF1 Improved Conditions requires the 'libWrapper' module.",
    "lib-wrapper",
    "pf1-improved-conditions",
    "MIXED",
    "Communal",
    "You have failed the saving throw!"
];

console.log("--- Verification Results ---");
samples.forEach(s => {
    console.log(`'${s}': ${isTranslatable(s)}`);
});
