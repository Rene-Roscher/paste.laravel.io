const root = document.documentElement;
const label = document.querySelector('.theme-label');

function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function render() {
    if (label) label.textContent = current() === 'dark' ? 'Dark' : 'Light';
}

export function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
    render();
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

document.getElementById('toggle-theme')?.addEventListener('click', () => {
    setTheme(current() === 'dark' ? 'light' : 'dark');
});

render();
