<x-layout>
    <x-slot:title>{{ \Illuminate\Support\Str::limit($paste->hash, 8, '') }}</x-slot:title>
    <x-slot:actions>
        <x-action label="New" icon="plus" :href="route('home')" />
        <x-action label="Copy" icon="copy" id="copy" />
        <x-action label="Fork" icon="fork" :href="route('edit', $paste->hash)" />
        <x-action label="Raw" icon="raw" :href="route('raw', $paste->hash)" blank />
    </x-slot:actions>

    <div id="editor" class="editor" data-mode="view"
         data-hash="{{ $paste->hash }}"
         data-created-at="{{ $paste->created_at?->toIso8601String() }}"
         data-mine="{{ session('created') ? '1' : '0' }}"
         data-parent="{{ $paste->parent_id ? '1' : '0' }}"></div>
    <div id="preview" class="preview" hidden><div class="preview-body"></div></div>
    {{-- Shown until Monaco is ready and when JavaScript is unavailable. --}}
    <pre id="code-fallback" class="fallback-view"><code>{{ $paste->code }}</code></pre>
</x-layout>
