@props(['name'])
@php
    $paths = [
        'plus' => 'M12 5v14M5 12h14',
        'copy' => 'M9 9h10v10H9zM5 15V5h10',
        'fork' => 'M6 3v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v4M6 3a2 2 0 1 0 0 .01M18 21a2 2 0 1 0 0 .01M6 21V9',
        'raw' => 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
        'save' => 'M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7',
        'reset' => 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
        'back' => 'M10 6l-6 6 6 6M4 12h16',
        'history' => 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
        'download' => 'M12 4v11M7 11l5 5 5-5M5 20h14',
    ];
@endphp
<svg {{ $attributes->merge(['class' => 'icon']) }} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ $paths[$name] }}"/></svg>
