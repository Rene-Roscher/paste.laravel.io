import './theme';

if (document.getElementById('editor')) {
    // Monaco is large: load it on demand so the page chrome renders immediately.
    import('./editor').then(({ boot }) => boot());
}
