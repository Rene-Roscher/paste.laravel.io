// User preferences, stored only in this browser (localStorage). The theme is handled in theme.js.
const KEY = 'paste-settings';

export const DEFAULTS = {
    fontFamily: 'mono', // mono | sans
    fontSize: 14,
    wordWrap: 'auto', // auto (on for text/markdown, off for code) | on | off
    minimap: true, // the code overview on the right
    lineNumbers: true,
    folding: true,
    whitespace: 'selection', // none | selection | all
    tabSize: 4,
    insertSpaces: true,
    autoClosing: 'auto', // auto (code only) | on | off
    markdown: 'preview', // preview | source: how markdown pastes open
    history: true, // remember visited pastes for Ctrl+K
};

let current = load();

function load() {
    try {
        const stored = JSON.parse(localStorage.getItem(KEY) ?? '{}');
        const clean = {};
        // Only accept known keys with the same type as the default, so a stale / tampered value cannot break the editor.
        for (const [k, v] of Object.entries(stored ?? {})) {
            if (k in DEFAULTS && typeof v === typeof DEFAULTS[k]) clean[k] = v;
        }
        return { ...DEFAULTS, ...clean };
    } catch (e) {
        return { ...DEFAULTS };
    }
}

function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) { /* storage unavailable */ }
}

export const getSettings = () => current;

export function setSetting(key, value) {
    if (!(key in DEFAULTS)) return;
    current = { ...current, [key]: value };
    persist();
    window.dispatchEvent(new CustomEvent('settingschange', { detail: { key, value } }));
}

export function resetSettings() {
    current = { ...DEFAULTS };
    persist();
    window.dispatchEvent(new CustomEvent('settingschange', { detail: { key: '*' } }));
}
