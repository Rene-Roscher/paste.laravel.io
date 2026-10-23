@props(['label', 'icon', 'href' => null, 'blank' => false, 'type' => 'button'])
@if ($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => 'btn']) }} @if($blank) target="_blank" rel="noopener noreferrer" @endif>
        <x-icon :name="$icon" /><span>{{ $label }}</span>
    </a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => 'btn']) }}>
        <x-icon :name="$icon" /><span>{{ $label }}</span>
    </button>
@endif
