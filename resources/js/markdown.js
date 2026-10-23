import DOMPurify from 'dompurify';
import { Marked } from 'marked';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Safety layers: (1) raw HTML in the markdown is shown as text, (2) images other than small inline
// data: images become plain links (no remote requests, no tracking), (3) DOMPurify sanitises the result,
// (4) the CSP forbids scripts and remote images anyway.
const marked = new Marked({
    gfm: true,
    breaks: true,
    renderer: {
        html: ({ text }) => escapeHtml(text),
        image: ({ href, text }) => {
            if (/^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(href)) {
                return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}">`;
            }
            return `<a href="${escapeHtml(href)}">[image: ${escapeHtml(text || href)}]</a>`;
        },
    },
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
        node.setAttribute('rel', 'noopener noreferrer nofollow ugc');
        if (!node.getAttribute('href')?.startsWith('#')) node.setAttribute('target', '_blank');
    }
    if (node.tagName === 'INPUT') {
        // Only the read-only task-list checkboxes marked emits.
        node.setAttribute('type', 'checkbox');
        node.setAttribute('disabled', '');
    }
});

export async function renderMarkdown(source, target, monaco) {
    const html = marked.parse(source, { async: false });
    const fragment = DOMPurify.sanitize(html, {
        RETURN_DOM_FRAGMENT: true,
        FORBID_TAGS: ['style', 'form', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'button', 'textarea', 'select'],
        FORBID_ATTR: ['style'],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|data:image\/)/i,
    });
    target.replaceChildren(fragment);

    // Syntax-highlight fenced code with the same tokenizer as the editor (output is escaped by Monaco).
    const languages = monaco.languages.getLanguages();
    const resolve = (name) => languages.find((l) => l.id === name || l.aliases?.some((a) => a.toLowerCase() === name) || l.extensions?.includes(`.${name}`))?.id;
    await Promise.all([...target.querySelectorAll('pre > code[class*="language-"]')].map(async (code) => {
        const lang = [...code.classList].find((c) => c.startsWith('language-'))?.slice(9);
        const id = lang && resolve(lang.toLowerCase());
        if (id) code.innerHTML = await monaco.editor.colorize(code.textContent, id, { tabSize: 4 });
    }));
}
