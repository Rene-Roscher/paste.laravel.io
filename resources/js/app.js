import './theme';
import './palette';
import './settings-ui';
import { getSettings } from './settings';
import { recordVisit } from './history';

const editor = document.getElementById('editor');

if (editor?.dataset.mode === 'view' && getSettings().history) {
    const code = document.getElementById('code-fallback')?.textContent ?? '';
    const firstLine = code.split('\n').find((l) => l.trim() !== '') ?? '';
    recordVisit({
        hash: editor.dataset.hash,
        createdAt: editor.dataset.createdAt,
        mine: editor.dataset.mine === '1',
        forked: editor.dataset.parent === '1',
        preview: firstLine.trim().slice(0, 80),
        lines: code.split('\n').length,
    });
}

if (editor) {
    // Monaco is large: load it on demand so the page chrome renders immediately.
    import('./editor').then(({ boot }) => boot());
}
