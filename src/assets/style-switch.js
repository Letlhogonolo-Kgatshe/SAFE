// Site style switcher: Quiet, Showcase or Midnight. The choice is saved in
// this browser and shared with the other sites on letlhogonolo-kgatshe.github.io.
// The page head applies it before anything is drawn, so nothing flashes.
(function () {
    var STYLES = ['quiet', 'showcase', 'midnight'];
    var DEFAULT = 'showcase';
    var THEME_COLOR = {"quiet":"#f7f5ef","showcase":"#ffffff","midnight":"#0d0c09"};
    var FONTS = {"quiet":"family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500","showcase":"family=Inter+Tight:wght@400;500;600;700","midnight":"family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@1"};
    var root = document.documentElement;

    function loadFonts(style) {
        var id = 'font-' + style;
        if (document.getElementById(id)) return;
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?' + FONTS[style] + '&display=swap';
        document.head.appendChild(link);
    }
    function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
    function recolourCharts() {
        if (!window.Chart) return;
        var tick = cssVar('--chart-tick'), grid = cssVar('--chart-grid');
        if (tick) window.Chart.defaults.color = tick;
        if (grid) window.Chart.defaults.borderColor = grid;
        Object.values(window.Chart.instances || {}).forEach(function (c) { c.update('none'); });
    }
    function markButtons(style) {
        document.querySelectorAll('[data-style-set]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-style-set') === style));
        });
    }
    function apply(style, save) {
        if (STYLES.indexOf(style) < 0) style = DEFAULT;
        root.setAttribute('data-style', style);
        loadFonts(style);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', THEME_COLOR[style]);
        markButtons(style);
        recolourCharts();
        if (save) { try { localStorage.setItem('site-style', style); } catch (e) { /* private mode: still switches */ } }
    }
    function render() {
        document.querySelectorAll('[data-style-switch]').forEach(function (slot) {
            if (slot.childElementCount) return;
            slot.className = (slot.className + ' style-switch').trim();
            slot.setAttribute('role', 'group');
            slot.setAttribute('aria-label', 'Site style');
            slot.innerHTML = STYLES.map(function (s) {
                return '<button type="button" data-style-set="' + s + '" aria-pressed="false">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
            }).join('');
        });
    }
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-style-set]');
        if (b) apply(b.getAttribute('data-style-set'), true);
    });
    render();
    apply(root.getAttribute('data-style'), false);
    window.addEventListener('load', recolourCharts);
    window.SiteStyle = { apply: apply, render: render, current: function () { return root.getAttribute('data-style'); } };
})();
