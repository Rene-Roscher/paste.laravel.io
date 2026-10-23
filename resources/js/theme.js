// Theme: 'system' (no stored value) | 'light' | 'dark'. theme-init.js applies it before first paint.
const root = document.documentElement;
const label = document.querySelector('.theme-label');
const media = window.matchMedia('(prefers-color-scheme: dark)');

export function getThemeMode() {
    try { return localStorage.getItem('theme') ?? 'system'; } catch (e) { return 'system'; }
}

const effective = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

function apply() {
    const mode = getThemeMode();
    root.dataset.theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    if (label) label.textContent = effective() === 'dark' ? 'Dark' : 'Light';
    window.dispatchEvent(new CustomEvent('themechange', { detail: effective() }));
}

export function setThemeMode(mode) {
    try {
        if (mode === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', mode);
    } catch (e) { /* storage unavailable */ }
    apply();
}

export const toggleTheme = () => setThemeMode(effective() === 'dark' ? 'light' : 'dark');

media.addEventListener('change', () => { if (getThemeMode() === 'system') apply(); });
document.getElementById('toggle-theme')?.addEventListener('click', toggleTheme);
apply();
