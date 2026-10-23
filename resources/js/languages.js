// [monaco id, label]
export const LANGUAGES = [
    ['plaintext', 'Plain Text'], ['php', 'PHP'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
    ['json', 'JSON'], ['html', 'HTML'], ['css', 'CSS'], ['scss', 'SCSS'], ['sql', 'SQL'], ['shell', 'Shell'],
    ['yaml', 'YAML'], ['xml', 'XML'], ['markdown', 'Markdown'], ['python', 'Python'], ['ini', 'INI / .env'],
    ['dockerfile', 'Dockerfile'], ['go', 'Go'], ['rust', 'Rust'], ['java', 'Java'], ['cpp', 'C++'],
    ['csharp', 'C#'], ['ruby', 'Ruby'], ['twig', 'Twig'],
];

// Old pastes have no stored language, so guess from the content. Cheap heuristics only.
export function detectLanguage(code) {
    const head = code.slice(0, 4000);
    const rules = [
        ['php', /<\?php|^\s*(namespace|use)\s+[\w\\]+;|\$this->|->\w+\(|::class\b/m],
        ['json', /^\s*[\[{][\s\S]*[\]}]\s*$/],
        ['html', /<!doctype html|<html[\s>]|<\/(div|span|body|head|script)>/i],
        ['xml', /^\s*<\?xml|^\s*<[\w:-]+[^>]*>[\s\S]*<\/[\w:-]+>\s*$/],
        ['sql', /^\s*(select|insert\s+into|update|delete\s+from|create\s+table|alter\s+table)\b/im],
        ['shell', /^#!\/.*\b(ba|z)?sh\b|^\s*(sudo|apt(-get)?|composer|npm|php artisan|docker|git|cd|curl)\s/m],
        ['dockerfile', /^FROM\s+\S+/m],
        ['python', /^\s*(def |import \w+|from \w+ import |print\()/m],
        ['typescript', /:\s*(string|number|boolean)\b|\binterface\s+\w+\s*\{/],
        ['javascript', /\b(const|let|var)\s+\w+\s*=|=>|\bfunction\s*\w*\(|console\.log/],
        ['css', /^[\s\S]*[.#]?[\w-]+\s*\{[^}]*:[^}]*;[^}]*\}/],
        ['yaml', /^\s*[\w-]+:\s*(\S.*)?\n\s+[\w-]+:/m],
        ['markdown', /^#{1,6}\s+\S|^\s*[-*]\s+\S.*\n\s*[-*]\s+\S|```/m],
        ['ini', /^[A-Z][A-Z0-9_]*=.*$/m],
    ];

    for (const [lang, re] of rules) {
        if (re.test(head)) return lang;
    }
    return 'plaintext';
}
