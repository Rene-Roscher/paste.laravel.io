import { clearHistory, loadHistory, removeFromHistory } from './history';
import { toggleTheme } from './theme';
import { openSettings } from './settings-ui';

const palette = document.getElementById('palette');
const input = document.getElementById('palette-input');
const list = document.getElementById('palette-list');

let items = [];
let active = 0;
let lastFocus = null;

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function relative(iso) {
    if (!iso) return '';
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, secs] of units) {
        if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
    }
    return 'just now';
}

function commands() {
    const here = document.getElementById('editor')?.dataset;
    const cmds = [
        { label: 'New paste', hint: 'Command', run: () => { location.href = '/'; } },
        { label: 'Toggle light / dark theme', hint: 'Command', run: toggleTheme },
        { label: 'Open settings', hint: 'Ctrl ,', run: openSettings },
    ];
    if (here?.hash) {
        cmds.push(
            { label: 'Copy paste', hint: 'Command', run: () => document.getElementById('copy')?.click() },
            { label: 'Fork paste', hint: 'Command', run: () => { location.href = `/fork/${here.hash}`; } },
            { label: 'Open raw', hint: 'Command', run: () => window.open(`/${here.hash}/raw`, '_blank', 'noopener') },
        );
    }
    cmds.push({
        label: 'Clear history', hint: 'Command',
        run: () => { if (confirm('Remove all pastes from this browser\'s history? The pastes themselves are not deleted.')) clearHistory(); },
    });
    return cmds;
}

function build(query) {
    const q = query.trim().toLowerCase();
    const current = document.getElementById('editor')?.dataset.hash;
    const entries = loadHistory().map((e) => ({
        entry: e,
        label: e.preview || '(empty)',
        run: () => { location.href = `/${e.hash}`; },
    }));
    const match = (text) => !q || text.toLowerCase().includes(q);

    const hist = entries.filter(({ entry, label }) => match(`${label} ${entry.hash}`));
    const cmds = commands().filter((c) => match(c.label));
    // With an empty query show history first, otherwise commands only after matching pastes.
    return [...hist.map((h) => ({ ...h, current: h.entry.hash === current })), ...cmds];
}

function render() {
    items = build(input.value);
    active = Math.min(active, Math.max(items.length - 1, 0));
    list.replaceChildren();

    if (!items.length) {
        const li = document.createElement('li');
        li.className = 'palette-empty';
        li.textContent = 'No matches';
        list.append(li);
        return;
    }

    let shownHeading = null;
    items.forEach((item, i) => {
        const heading = item.entry ? 'History' : 'Commands';
        if (heading !== shownHeading) {
            const h = document.createElement('li');
            h.className = 'palette-heading';
            h.textContent = heading;
            h.setAttribute('role', 'presentation');
            list.append(h);
            shownHeading = heading;
        }

        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'palette-item' + (i === active ? ' active' : '');
        li.dataset.index = i;

        const main = document.createElement('span');
        main.className = 'palette-main';
        main.textContent = item.label;
        li.append(main);

        if (item.entry) {
            const meta = document.createElement('span');
            meta.className = 'palette-meta';
            const when = item.entry.createdAt ? `created ${relative(item.entry.createdAt)}` : `visited ${relative(item.entry.visitedAt)}`;
            const flags = [item.entry.mine ? 'yours' : null, item.entry.forked ? 'fork' : null, item.current ? 'open' : null].filter(Boolean);
            meta.textContent = [item.entry.hash.slice(0, 8), item.entry.lines ? `${item.entry.lines} lines` : null, when, ...flags].filter(Boolean).join(' · ');
            meta.title = item.entry.createdAt ? new Date(item.entry.createdAt).toLocaleString() : '';
            li.append(meta);

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'palette-del';
            del.title = 'Remove from history';
            del.setAttribute('aria-label', 'Remove from history');
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromHistory(item.entry.hash);
                render();
            });
            li.append(del);
        } else {
            const meta = document.createElement('span');
            meta.className = 'palette-meta';
            meta.textContent = item.hint;
            li.append(meta);
        }

        li.addEventListener('click', () => choose(i));
        li.addEventListener('mousemove', () => { if (active !== i) { active = i; markActive(); } });
        list.append(li);
    });
}

function markActive() {
    list.querySelectorAll('.palette-item').forEach((el) => {
        const on = Number(el.dataset.index) === active;
        el.classList.toggle('active', on);
        if (on) el.scrollIntoView({ block: 'nearest' });
    });
}

function choose(i) {
    const item = items[i];
    if (!item) return;
    close();
    item.run();
}

export function open() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    input.value = '';
    active = 0;
    render();
    input.focus();
}

export function close() {
    palette.hidden = true;
    // Give focus back to the editor / page the user came from.
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

input.addEventListener('input', () => { active = 0; render(); });

palette.addEventListener('mousedown', (e) => { if (e.target === palette) close(); });

palette.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(items.length, 1); markActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + items.length) % Math.max(items.length, 1); markActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
});

// Capture phase so Monaco's own Ctrl+K chord handling never sees it.
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === 'KeyK') {
        e.preventDefault();
        e.stopPropagation();
        palette.hidden ? open() : close();
    }
}, true);

document.getElementById('open-palette')?.addEventListener('click', open);
