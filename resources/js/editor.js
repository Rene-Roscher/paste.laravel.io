import { monaco } from './monaco-core';
import { LANGUAGES, detectLanguage } from './languages';

// Only the generic worker is used (no language services), bundled and served from our origin.
self.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
};

const root = document.documentElement;
const isDark = () => root.dataset.theme === 'dark';

function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
}

function defineThemes() {
    // Same colours as the surrounding UI so the editor blends into the page.
    monaco.editor.defineTheme('paste-dark', {
        base: 'vs-dark', inherit: true, rules: [],
        colors: { 'editor.background': '#0F192A', 'editorGutter.background': '#0F192A' },
    });
    monaco.editor.defineTheme('paste-light', {
        base: 'vs', inherit: true, rules: [],
        colors: { 'editor.background': '#ffffff', 'editorGutter.background': '#ffffff' },
    });
}

const themeName = () => (isDark() ? 'paste-dark' : 'paste-light');

export async function boot() {
    const container = document.getElementById('editor');
    const source = document.getElementById('code-source');
    const fallback = document.getElementById('code-fallback');
    const readOnly = container.dataset.mode === 'view';

    const code = readOnly ? (fallback?.textContent ?? '') : (source?.value ?? '');

    // Make sure the local web font is ready before Monaco measures glyph widths.
    try { await document.fonts.load('14px "Geist Mono Variable"'); } catch (e) { /* ignore */ }

    defineThemes();

    const language = detectLanguage(code);
    const model = monaco.editor.createModel(code, language);

    const editor = monaco.editor.create(container, {
        model,
        theme: themeName(),
        readOnly,
        domReadOnly: readOnly,
        readOnlyMessage: { value: 'Pastes are read-only. Use Fork to edit a copy.' },
        fontFamily: cssVar('--font-code'),
        fontSize: 14,
        lineHeight: 22,
        fontLigatures: false,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        // Sticky scroll pins nested scopes at the top while scrolling: explicitly off.
        stickyScroll: { enabled: false },
        minimap: { enabled: window.innerWidth > 900 },
        folding: true,
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        guides: { indentation: true, bracketPairs: false },
        smoothScrolling: true,
        padding: { top: 12, bottom: 12 },
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'off',
        accessibilitySupport: 'auto',
        unicodeHighlight: { ambiguousCharacters: true, invisibleCharacters: true },
        links: true,
        contextmenu: true,
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: 'off',
        parameterHints: { enabled: false },
        occurrencesHighlight: 'singleFile',
        placeholder: readOnly ? undefined : "<?php\n\necho 'Share your snippet here!';",
        ariaLabel: readOnly ? 'Paste (read-only)' : 'Paste editor',
    });

    container.hidden = false;
    if (source && !readOnly) source.hidden = true;
    fallback?.remove();
    editor.layout();
    editor.focus();

    wireStatusBar(editor, model, !readOnly);
    wireTheme();

    if (readOnly) {
        document.getElementById('copy')?.addEventListener('click', (e) => copy(editor.getValue(), e.currentTarget));
    } else {
        wireForm(editor, source);
    }
}

function wireStatusBar(editor, model, autoDetect) {
    const position = document.getElementById('status-position');
    const count = document.getElementById('status-count');
    const select = document.getElementById('language-select');
    const wrapBtn = document.getElementById('toggle-wrap');

    const updatePosition = () => {
        const p = editor.getPosition();
        const sel = editor.getSelection();
        const selected = sel && !sel.isEmpty() ? ` (${model.getValueInRange(sel).length} selected)` : '';
        position.textContent = `Ln ${p.lineNumber}, Col ${p.column}${selected}`;
    };
    const updateCount = () => {
        const lines = model.getLineCount();
        const chars = model.getValueLength();
        count.textContent = `${lines.toLocaleString()} lines · ${chars.toLocaleString()} chars`;
    };

    editor.onDidChangeCursorSelection(updatePosition);
    editor.onDidChangeModelContent(updateCount);
    updatePosition();
    updateCount();

    for (const [id, label] of LANGUAGES) {
        select.add(new Option(label, id));
    }
    select.value = model.getLanguageId();
    select.hidden = false;
    let manual = false;
    select.addEventListener('change', () => {
        manual = true;
        monaco.editor.setModelLanguage(model, select.value);
    });

    // While writing a new paste, keep guessing the language until the user picks one.
    if (autoDetect) {
        let timer;
        model.onDidChangeContent(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (manual) return;
                const guess = detectLanguage(model.getValue());
                if (guess !== model.getLanguageId()) {
                    monaco.editor.setModelLanguage(model, guess);
                    select.value = guess;
                }
            }, 400);
        });
    }

    if (!LANGUAGES.some(([id]) => id === model.getLanguageId())) select.value = 'plaintext';

    let wrap = false;
    const toggleWrap = () => {
        wrap = !wrap;
        editor.updateOptions({ wordWrap: wrap ? 'on' : 'off' });
        wrapBtn.textContent = `Wrap: ${wrap ? 'on' : 'off'}`;
    };
    wrapBtn.hidden = false;
    wrapBtn.addEventListener('click', toggleWrap);
    editor.addAction({
        id: 'paste.toggleWrap', label: 'Toggle Word Wrap',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        run: toggleWrap,
    });
}

function wireTheme() {
    window.addEventListener('themechange', () => monaco.editor.setTheme(themeName()));
}

function wireForm(editor, source) {
    const form = document.getElementById('paste-form');
    const initial = editor.getValue();

    // The textarea is hidden now, so native `required` validation could not focus it. We validate ourselves.
    source.required = false;
    source.removeAttribute('maxlength');

    const sync = () => { source.value = editor.getValue(); };
    form.addEventListener('formdata', (e) => e.formData.set('code', editor.getValue()));
    form.addEventListener('submit', (e) => {
        sync();
        if (!source.value.trim()) {
            e.preventDefault();
            editor.focus();
        }
    });
    form.addEventListener('reset', () => {
        editor.setValue(initial);
        editor.focus();
    });

    // Ctrl/Cmd+S saves, also while the editor has focus.
    const save = () => { sync(); form.requestSubmit(); };
    editor.addAction({
        id: 'paste.save', label: 'Save Paste',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: save,
    });
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
            e.preventDefault();
            save();
        }
    });
}

async function copy(text, button) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    }
    const label = button.querySelector('span');
    const original = label.textContent;
    label.textContent = 'Copied!';
    setTimeout(() => { label.textContent = original; }, 1500);
}
