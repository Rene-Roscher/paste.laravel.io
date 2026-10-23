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
<div id="palette" class="palette" role="dialog" aria-modal="true" aria-label="History and commands" hidden>
    <div class="palette-box">
        <input id="palette-input" type="text" placeholder="Search history or type a command…" autocomplete="off" spellcheck="false" aria-label="Search">
        <ul id="palette-list" role="listbox"></ul>
        <div class="palette-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
    </div>
</div>
</body>
</html>
