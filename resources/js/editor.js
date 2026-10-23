import { monaco } from './monaco-core';
import { LANGUAGES, detectLanguage } from './languages';
import { getSettings, setSetting } from './settings';

// Only the generic worker is used (no language services), bundled and served from our origin.
self.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
};

const root = document.documentElement;
const isDark = () => root.dataset.theme === 'dark';
const themeName = () => (isDark() ? 'paste-dark' : 'paste-light');
const isProse = (lang) => lang === 'plaintext' || lang === 'markdown';

function defineThemes() {
    // Same palette as the page chrome (Tailwind neutral-950 / white) so the editor blends in.
    monaco.editor.defineTheme('paste-dark', {
        base: 'vs-dark', inherit: true, rules: [],
        colors: {
            'editor.background': '#0a0a0a',
            'editorGutter.background': '#0a0a0a',
            'editor.lineHighlightBackground': '#141414',
            'editor.lineHighlightBorder': '#00000000',
            'editorLineNumber.foreground': '#525252',
            'editorLineNumber.activeForeground': '#a3a3a3',
            'editorIndentGuide.background1': '#1f1f1f',
            'minimap.background': '#0a0a0a',
            'scrollbarSlider.background': '#52525233',
        },
    });
    monaco.editor.defineTheme('paste-light', {
        base: 'vs', inherit: true, rules: [],
        colors: { 'editor.background': '#ffffff', 'editorGutter.background': '#ffffff', 'editor.lineHighlightBorder': '#00000000', 'editor.lineHighlightBackground': '#f5f5f5' },
    });
}

/** Maps user settings (and the language, for the "auto" choices) to Monaco options. */
function optionsFor(settings, lang) {
    const prose = isProse(lang);
    const closing = settings.autoClosing === 'auto' ? !prose : settings.autoClosing === 'on';
    const family = getComputedStyle(root).getPropertyValue(settings.fontFamily === 'sans' ? '--font-sans' : '--font-mono').trim();
    return {
        fontFamily: family,
        fontSize: settings.fontSize,
        lineHeight: Math.round(settings.fontSize * (prose ? 1.7 : 1.6)),
        wordWrap: settings.wordWrap === 'auto' ? (prose ? 'on' : 'off') : settings.wordWrap,
        minimap: { enabled: settings.minimap && window.innerWidth > 700 },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
        folding: settings.folding,
        renderWhitespace: settings.whitespace,
        tabSize: settings.tabSize,
        insertSpaces: settings.insertSpaces,
        autoClosingBrackets: closing ? 'languageDefined' : 'never',
        autoClosingQuotes: closing ? 'languageDefined' : 'never',
        autoSurround: closing ? 'languageDefined' : 'never',
        renderLineHighlight: prose ? 'none' : 'line',
    };
}

export async function boot() {
    const container = document.getElementById('editor');
    const source = document.getElementById('code-source');
    const fallback = document.getElementById('code-fallback');
    const readOnly = container.dataset.mode === 'view';
    const code = readOnly ? (fallback?.textContent ?? '') : (source?.value ?? '');
    const settings = getSettings();

    defineThemes();

    // Make sure the local web fonts are ready before Monaco measures glyph widths.
    try { await Promise.all([document.fonts.load('14px "Geist Mono Variable"'), document.fonts.load('14px "Plus Jakarta Sans Variable"')]); } catch (e) { /* ignore */ }

    const model = monaco.editor.createModel(code, detectLanguage(code));
    const editor = monaco.editor.create(container, {
        model,
        theme: themeName(),
        readOnly,
        domReadOnly: readOnly,
        readOnlyMessage: { value: 'Pastes are read-only. Use Fork to edit a copy.' },
        ...optionsFor(settings, model.getLanguageId()),
        fontLigatures: false,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        // Sticky scroll pins nested scopes at the top while scrolling: explicitly off.
        stickyScroll: { enabled: false },
        bracketPairColorization: { enabled: true },
        guides: { indentation: true, bracketPairs: false },
        smoothScrolling: true,
        padding: { top: 12, bottom: 12 },
        wrappingIndent: 'same',
        unicodeHighlight: { ambiguousCharacters: true, invisibleCharacters: true },
        links: true,
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

    const apply = () => editor.updateOptions(optionsFor(getSettings(), model.getLanguageId()));
    window.addEventListener('settingschange', apply);
    model.onDidChangeLanguage(apply);
    window.addEventListener('themechange', () => monaco.editor.setTheme(themeName()));
    window.addEventListener('settingschange', () => document.fonts.ready.then(() => monaco.editor.remeasureFonts()));

    const view = wireMarkdown(editor, model, container, readOnly);
    wireStatusBar(editor, model, !readOnly);

    if (readOnly) {
        document.getElementById('copy')?.addEventListener('click', (e) => copy(editor.getValue(), e.currentTarget));
    } else {
        wireForm(editor, source, view);
    }
}

/** Source / Preview toggle, only offered for markdown. Returns helpers used by the form. */
function wireMarkdown(editor, model, container, readOnly) {
    const toggle = document.getElementById('view-toggle');
    const preview = document.getElementById('preview');
    const body = preview.querySelector('.preview-body');
    const buttons = { source: document.getElementById('view-source'), preview: document.getElementById('view-preview') };
    let mode = 'source';

    const show = async (next) => {
        mode = next;
        buttons.source.setAttribute('aria-pressed', String(next === 'source'));
        buttons.preview.setAttribute('aria-pressed', String(next === 'preview'));
        if (next === 'preview') {
            const { renderMarkdown } = await import('./markdown');
            await renderMarkdown(model.getValue(), body, monaco);
            preview.scrollTop = 0;
        }
        preview.hidden = next !== 'preview';
        container.hidden = next === 'preview';
        if (next === 'source') { editor.layout(); editor.focus(); }
    };

    const update = () => {
        const markdown = model.getLanguageId() === 'markdown';
        toggle.hidden = !markdown;
        if (!markdown && mode === 'preview') show('source');
    };

    buttons.source.addEventListener('click', () => show('source'));
    buttons.preview.addEventListener('click', () => show('preview'));
    model.onDidChangeLanguage(update);
    update();

    // Markdown pastes open rendered by default (configurable); new pastes always start in the editor.
    if (readOnly && model.getLanguageId() === 'markdown' && getSettings().markdown === 'preview') show('preview');

    return { current: () => mode };
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
        const words = model.getValue().trim().split(/\s+/).filter(Boolean).length;
        count.textContent = `${model.getLineCount().toLocaleString()} lines · ${words.toLocaleString()} words · ${model.getValueLength().toLocaleString()} chars`;
    };

    editor.onDidChangeCursorSelection(updatePosition);
    editor.onDidChangeModelContent(updateCount);
    updatePosition();
    updateCount();

    for (const [id, label] of LANGUAGES) select.add(new Option(label, id));
    const syncSelect = () => { select.value = LANGUAGES.some(([id]) => id === model.getLanguageId()) ? model.getLanguageId() : 'plaintext'; };
    syncSelect();
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
                    syncSelect();
                }
            }, 400);
        });
    }

    // The wrap button shows the effective state and flips it, saving the explicit choice.
    const wrapped = () => editor.getOption(monaco.editor.EditorOption.wordWrap) !== 'off';
    const renderWrap = () => { wrapBtn.textContent = `Wrap: ${wrapped() ? 'on' : 'off'}`; };
    const toggleWrap = () => setSetting('wordWrap', wrapped() ? 'off' : 'on');
    wrapBtn.hidden = false;
    wrapBtn.addEventListener('click', toggleWrap);
    editor.onDidChangeConfiguration((e) => { if (e.hasChanged(monaco.editor.EditorOption.wordWrap)) renderWrap(); });
    renderWrap();
    editor.addAction({
        id: 'paste.toggleWrap', label: 'Toggle Word Wrap',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        run: toggleWrap,
    });
}

function wireForm(editor, source, view) {
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
        if (view.current() === 'source') editor.focus();
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
