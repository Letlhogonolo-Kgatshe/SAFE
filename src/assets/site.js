// SAFE shared layout: header, footer, mobile menu, back-to-top, reveal,
// plus small helpers used by every page (window.SAFE).
(function () {
    'use strict';

    const PAGES = [
        { href: 'index.html', label: 'Home' },
        { href: 'learn.html', label: 'Learn' },
        { href: 'glossary.html', label: 'Glossary' },
        { href: 'tools.html', label: 'Money tools' },
        { href: 'game.html', label: 'Stock game' },
        { href: 'faq.html', label: 'FAQ & contact' },
    ];
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    // ── Helpers ─────────────────────────────────────────────────────────
    const store = {
        get(key, fallback) { try { const v = localStorage.getItem('safe:' + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
        set(key, value) { try { localStorage.setItem('safe:' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } },
    };
    const rand = (n, dp = 0) => 'R' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let toastTimer;
    function toast(msg) {
        let el = document.getElementById('safe-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'safe-toast';
            el.setAttribute('role', 'status');
            el.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] bg-card border border-gold/40 text-white px-5 py-3 rounded-xl shadow-2xl text-sm hidden';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
    }
    window.SAFE = { store, rand, esc, slug, toast };

    // ── Header ──────────────────────────────────────────────────────────
    const links = PAGES.map((p) => `<a href="${p.href}" class="nav-link"${p.href === here ? ' aria-current="page"' : ''}>${p.label}</a>`).join('');
    const header = document.createElement('header');
    header.className = 'bg-black/90 backdrop-blur border-b border-white/10 sticky top-0 z-50';
    header.innerHTML = `
        <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-gold text-black px-4 py-2 rounded z-[60]">Skip to content</a>
        <div class="wrap flex items-center justify-between h-16 gap-4">
            <a href="index.html" class="flex items-center gap-3 shrink-0" aria-label="SAFE home">
                <img src="SAFE.jpg" alt="" class="w-9 h-9 rounded-lg object-cover">
                <span class="leading-tight"><span class="block font-display text-lg font-bold text-gold tracking-wide">SAFE</span>
                <span class="hidden sm:block text-[11px] text-gray-400">South African Financial Education</span></span>
            </a>
            <nav class="hidden lg:flex items-center gap-1" aria-label="Main">${links}</nav>
            <a href="tools.html" class="hidden lg:inline-flex btn-gold !py-2 text-sm">Open money tools</a>
            <button id="menu-btn" class="lg:hidden text-gold text-2xl w-10 h-10 grid place-items-center rounded-lg hover:bg-white/5" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">☰</button>
        </div>
        <nav id="mobile-menu" class="hidden lg:hidden border-t border-white/10 bg-black" aria-label="Mobile">
            <div class="wrap py-3 grid grid-cols-2 gap-1">${PAGES.map((p) => `<a href="${p.href}" class="nav-link !py-3"${p.href === here ? ' aria-current="page"' : ''}>${p.label}</a>`).join('')}</div>
        </nav>`;
    document.body.prepend(header);
    const menuBtn = header.querySelector('#menu-btn'), menu = header.querySelector('#mobile-menu');
    menuBtn.addEventListener('click', () => {
        const open = menu.classList.toggle('hidden') === false;
        menuBtn.setAttribute('aria-expanded', open);
        menuBtn.textContent = open ? '✕' : '☰';
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // ── Footer ──────────────────────────────────────────────────────────
    const footer = document.createElement('footer');
    footer.className = 'border-t border-white/10 bg-black mt-8';
    footer.innerHTML = `
        <div class="wrap py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
                <p class="font-display text-xl font-bold text-gold">SAFE</p>
                <p class="text-gray-400 mt-2">Free, beginner-friendly financial education for South Africans. Built for the South African Intervarsity Hackathon 2025.</p>
            </div>
            <div><p class="font-semibold mb-3">Learn</p><ul class="space-y-2 text-gray-400">
                <li><a class="hover:text-gold" href="learn.html">Learning library</a></li><li><a class="hover:text-gold" href="glossary.html">Glossary</a></li><li><a class="hover:text-gold" href="index.html#path">Learning path</a></li></ul></div>
            <div><p class="font-semibold mb-3">Tools</p><ul class="space-y-2 text-gray-400">
                <li><a class="hover:text-gold" href="tools.html#budget">Budget planner</a></li><li><a class="hover:text-gold" href="tools.html#debt">Debt payoff</a></li><li><a class="hover:text-gold" href="tools.html#property">Property costs</a></li><li><a class="hover:text-gold" href="game.html">Stock market game</a></li></ul></div>
            <div><p class="font-semibold mb-3">SAFE</p><ul class="space-y-2 text-gray-400">
                <li><a class="hover:text-gold" href="faq.html">FAQ</a></li><li><a class="hover:text-gold" href="faq.html#contact">Contact</a></li>
                <li><a class="hover:text-gold" href="https://whatsapp.com/channel/0029Vavvo9GCRs1fQl620s1M" target="_blank" rel="noopener">WhatsApp channel</a></li></ul></div>
        </div>
        <div class="border-t border-white/10"><div class="wrap py-6 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 justify-between">
            <p>© ${new Date().getFullYear()} SAFE. Educational information only, not financial advice. For personalised advice, consult an FSCA-registered financial advisor.</p>
            <p>Built by <a class="hover:text-gold" href="https://letlhogonolo-kgatshe.github.io/" target="_blank" rel="noopener">Letlhogonolo Kgatshe</a></p>
        </div></div>`;
    document.body.appendChild(footer);

    // ── Back to top ─────────────────────────────────────────────────────
    const top = document.createElement('button');
    top.className = 'fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-gold text-black font-bold shadow-xl opacity-0 pointer-events-none transition';
    top.setAttribute('aria-label', 'Back to top');
    top.textContent = '↑';
    document.body.appendChild(top);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        const show = window.scrollY > 500;
        top.classList.toggle('opacity-0', !show);
        top.classList.toggle('pointer-events-none', !show);
    }, { passive: true });

    // ── Reveal on scroll ────────────────────────────────────────────────
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function reveal(root = document) {
        const els = root.querySelectorAll('.reveal:not(.visible)');
        if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('visible')); return; }
        const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: 0.08 });
        els.forEach((e) => io.observe(e));
    }
    window.SAFE.reveal = reveal;
    document.addEventListener('DOMContentLoaded', () => reveal());
})();
