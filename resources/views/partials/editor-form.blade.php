{{-- Works without JavaScript (plain textarea); Monaco replaces it as soon as the script is loaded. --}}
<form action="{{ $action }}" method="POST" id="paste-form" class="editor-form">
    @csrf
    {{-- The newline after the tag is swallowed by the HTML parser, so a leading blank line in the code survives. --}}
    <textarea name="code" id="code-source" class="fallback-editor" spellcheck="false" autocomplete="off" required maxlength="50000"
              placeholder="<?php&#10;&#10;echo 'Share your snippet here!';">
{{ old('code', $code ?? '') }}</textarea>
    <div id="editor" class="editor" data-mode="edit" hidden></div>
</form>

<div id="preview" class="preview" hidden><div class="preview-body"></div></div>
