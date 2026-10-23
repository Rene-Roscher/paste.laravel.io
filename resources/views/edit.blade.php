<x-layout>
    <x-slot:title>fork of {{ \Illuminate\Support\Str::limit($paste->hash, 8, '') }}</x-slot:title>
    <x-slot:actions>
        <x-action label="Save" icon="save" type="submit" form="paste-form" id="save" class="btn-primary" />
        <x-action label="Reset" icon="reset" type="reset" form="paste-form" id="reset" />
        <x-action label="Back" icon="back" :href="route('show', $paste->hash)" />
    </x-slot:actions>

    @include('partials.editor-form', ['action' => route('edit', $paste->hash), 'code' => $paste->code])
</x-layout>
