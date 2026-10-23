<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="color-scheme" content="dark light">
    <meta name="theme-color" content="#0F192A">

    @unless (request()->is('/'))
        {{-- We don't want to allow indexing of pastes. --}}
        <meta name="robots" content="noindex">
    @endunless

    <title>Paste | LIVCK</title>

    {{-- Sets data-theme before first paint (no flash). Served from our own origin, CSP forbids inline scripts. --}}
    <script src="/theme-init.js"></script>

    <link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
<div class="app">
    <header class="titlebar">
        <a href="{{ route('home') }}" class="brand" aria-label="LIVCK Paste" title="New paste">
            <img src="/images/livck-mark.svg" alt="" width="18" height="23" class="logo">
        </a>
        @isset($title)
            <span class="filename" title="{{ $title }}">{{ $title }}</span>
        @endisset
        <nav class="actions">
            {{ $actions ?? '' }}
            <span class="sep" aria-hidden="true"></span>
            <button type="button" class="btn" id="open-settings" title="Settings (Ctrl+,)" aria-label="Settings">
                <x-icon name="settings" /><span>Settings</span>
            </button>
            <button type="button" class="btn" id="open-palette" title="History &amp; commands (Ctrl+K)">
                <x-icon name="history" /><span>History</span><kbd>Ctrl K</kbd>
            </button>
        </nav>
    </header>

    <main class="workspace">
        {{ $slot }}
    </main>

    <footer class="statusbar">
        <span class="status-item" id="status-position">Ln 1, Col 1</span>
        <span class="status-item" id="status-count"></span>
        <span class="spacer"></span>
        @if (! empty($errors) && $errors->any())
            <span class="status-item status-error" role="alert">{{ $errors->first() }}</span>
        @endif
        <button type="button" class="status-item status-btn" id="toggle-wrap" hidden title="Toggle word wrap (Alt+Z)">Wrap: off</button>
        <label class="status-item status-select" title="Language">
            <span class="sr-only">Language</span>
            <select id="language-select" hidden></select>
        </label>
        <button type="button" class="status-item status-btn" id="toggle-theme" title="Toggle light / dark theme">
            <span class="theme-label"></span>
        </button>
    </footer>
</div>
<div id="palette" class="overlay palette" role="dialog" aria-modal="true" aria-label="History and commands" hidden>
    <div class="palette-box">
        <input id="palette-input" type="text" placeholder="Search history or type a command…" autocomplete="off" spellcheck="false" aria-label="Search">
        <ul id="palette-list" role="listbox"></ul>
        <div class="palette-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
    </div>
</div>
<div id="settings" class="overlay drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title" hidden>
    <div class="drawer-panel" tabindex="-1">
        <div class="drawer-head">
            <span id="settings-title">Settings</span>
            <button type="button" class="btn" id="settings-close" aria-label="Close settings">✕</button>
        </div>
        <div class="drawer-body">
            <p class="text-xs text-muted">Saved in this browser only.</p>

            <section>
                <h3 class="group-title">Appearance</h3>
                <div class="setting"><label for="s-theme">Theme</label>
                    <select id="s-theme" data-setting="theme"><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></select></div>
                <div class="setting"><label for="s-font">Editor font</label>
                    <select id="s-font" data-setting="fontFamily"><option value="mono">Monospace</option><option value="sans">Proportional</option></select></div>
                <div class="setting"><label for="s-size">Font size</label>
                    <select id="s-size" data-setting="fontSize">@foreach ([12, 13, 14, 15, 16, 18, 20, 24] as $size)<option value="{{ $size }}">{{ $size }} px</option>@endforeach</select></div>
            </section>

            <section>
                <h3 class="group-title">Editor</h3>
                <div class="setting"><label for="s-minimap">Code overview on the right<span class="hint">The minimap next to the scrollbar</span></label>
                    <input id="s-minimap" type="checkbox" data-setting="minimap"></div>
                <div class="setting"><label for="s-lines">Line numbers</label><input id="s-lines" type="checkbox" data-setting="lineNumbers"></div>
                <div class="setting"><label for="s-fold">Code folding</label><input id="s-fold" type="checkbox" data-setting="folding"></div>
                <div class="setting"><label for="s-wrap">Word wrap<span class="hint">Auto wraps text and markdown, not code</span></label>
                    <select id="s-wrap" data-setting="wordWrap"><option value="auto">Auto</option><option value="on">On</option><option value="off">Off</option></select></div>
                <div class="setting"><label for="s-ws">Show whitespace</label>
                    <select id="s-ws" data-setting="whitespace"><option value="none">Never</option><option value="selection">In selection</option><option value="all">Always</option></select></div>
                <div class="setting"><label for="s-tab">Tab size</label>
                    <select id="s-tab" data-setting="tabSize"><option value="2">2</option><option value="4">4</option><option value="8">8</option></select></div>
                <div class="setting"><label for="s-spaces">Indent with spaces</label><input id="s-spaces" type="checkbox" data-setting="insertSpaces"></div>
                <div class="setting"><label for="s-close">Auto-close brackets and quotes<span class="hint">Auto skips plain text and markdown</span></label>
                    <select id="s-close" data-setting="autoClosing"><option value="auto">Auto</option><option value="on">On</option><option value="off">Off</option></select></div>
            </section>

            <section>
                <h3 class="group-title">History</h3>
                <div class="setting"><label for="s-history">Remember pastes I open<span class="hint">Shown in the Ctrl+K overview</span></label>
                    <input id="s-history" type="checkbox" data-setting="history"></div>
                <button type="button" class="btn" id="settings-clear-history">Clear history</button>
            </section>

            <section>
                <h3 class="group-title">Shortcuts</h3>
                <div class="shortcuts">
                    <span>Save paste</span><kbd>Ctrl S</kbd>
                    <span>History &amp; commands</span><kbd>Ctrl K</kbd>
                    <span>Settings</span><kbd>Ctrl ,</kbd>
                    <span>Toggle word wrap</span><kbd>Alt Z</kbd>
                    <span>Find</span><kbd>Ctrl F</kbd>
                    <span>Close dialogs</span><kbd>Esc</kbd>
                </div>
            </section>
        </div>
        <div class="drawer-foot">
            <button type="button" class="btn" id="settings-reset">Reset to defaults</button>
        </div>
    </div>
</div>
</body>
</html>
