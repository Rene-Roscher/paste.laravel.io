@props(['code', 'title', 'message'])
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>{{ $code }} · {{ $title }} | LIVCK Paste</title>
    <script src="/theme-init.js"></script>
    <link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg">
    @vite('resources/css/app.css')
</head>
<body>
<main class="grid h-dvh place-items-center px-6 text-center">
    <div>
        <img src="/images/livck-mark.svg" alt="" width="28" height="36" class="mx-auto mb-6">
        <p class="font-mono text-sm text-muted">{{ $code }}</p>
        <h1 class="mt-1 text-2xl font-semibold">{{ $title }}</h1>
        <p class="mx-auto mt-2 max-w-sm text-muted">{{ $message }}</p>
        <a href="/" class="btn btn-primary mt-6">New paste</a>
    </div>
</main>
</body>
</html>
