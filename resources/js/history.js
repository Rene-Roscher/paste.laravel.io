// Local-only paste history (browser localStorage). Nothing is sent to the server.
const KEY = 'paste-history';
const MAX = 200;

export function loadHistory() {
    try {
        const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
        return Array.isArray(list) ? list.filter((e) => e && typeof e.hash === 'string') : [];
    } catch (e) {
        return [];
    }
}

function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch (e) { /* storage full / blocked */ }
}

export function clearHistory() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

export function removeFromHistory(hash) {
    save(loadHistory().filter((e) => e.hash !== hash));
}

/** Remember the paste currently shown. `mine` sticks once set (created / forked in this browser). */
export function recordVisit({ hash, createdAt, mine, forked, preview, lines }) {
    const list = loadHistory();
    const existing = list.find((e) => e.hash === hash);
    const entry = {
        hash,
        createdAt: createdAt || existing?.createdAt || null,
        visitedAt: new Date().toISOString(),
        mine: Boolean(mine || existing?.mine),
        forked: Boolean(forked),
        preview,
        lines,
    };
    save([entry, ...list.filter((e) => e.hash !== hash)]);
}
