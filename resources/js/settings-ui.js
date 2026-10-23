import { clearHistory } from './history';
import { DEFAULTS, getSettings, resetSettings, setSetting } from './settings';
import { getThemeMode, setThemeMode } from './theme';

const drawer = document.getElementById('settings');
let lastFocus = null;

const controls = () => [...drawer.querySelectorAll('[data-setting]')];

function read(el) {
    if (el.type === 'checkbox') return el.checked;
    if (typeof DEFAULTS[el.dataset.setting] === 'number') return Number(el.value);
    return el.value;
}

function sync() {
    const settings = getSettings();
    for (const el of controls()) {
        const key = el.dataset.setting;
        const value = key === 'theme' ? getThemeMode() : settings[key];
        if (el.type === 'checkbox') el.checked = Boolean(value);
        else el.value = String(value);
    }
}

export function openSettings() {
    lastFocus = document.activeElement;
    sync();
    drawer.hidden = false;
    drawer.querySelector('.drawer-panel').focus();
}

export function closeSettings() {
    drawer.hidden = true;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

drawer.addEventListener('change', (e) => {
    const el = e.target.closest('[data-setting]');
    if (!el) return;
    if (el.dataset.setting === 'theme') setThemeMode(el.value);
    else setSetting(el.dataset.setting, read(el));
});

drawer.addEventListener('mousedown', (e) => { if (e.target === drawer) closeSettings(); });
drawer.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeSettings(); } });
document.getElementById('settings-close').addEventListener('click', closeSettings);
document.getElementById('open-settings')?.addEventListener('click', openSettings);

document.getElementById('settings-reset').addEventListener('click', () => {
    resetSettings();
    setThemeMode('system');
    sync();
});

document.getElementById('settings-clear-history').addEventListener('click', (e) => {
    if (confirm('Remove all pastes from this browser\'s history? The pastes themselves are not deleted.')) {
        clearHistory();
        e.currentTarget.textContent = 'History cleared';
    }
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key === ',') {
        e.preventDefault();
        e.stopPropagation();
        drawer.hidden ? openSettings() : closeSettings();
    }
}, true);
