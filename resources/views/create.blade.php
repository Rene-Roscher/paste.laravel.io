<x-layout>
    <x-slot:title>untitled</x-slot:title>
    <x-slot:actions>
        <x-action label="Save" icon="save" type="submit" form="paste-form" id="save" class="btn-primary" />
        <x-action label="Reset" icon="reset" type="reset" form="paste-form" id="reset" />
    </x-slot:actions>

    @include('partials.editor-form', ['action' => route('home')])
</x-layout>
