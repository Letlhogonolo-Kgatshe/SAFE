// Shared Tailwind (CDN) theme for every SAFE page. Colours come from CSS
// variables set per style (Quiet, Showcase, Midnight) in site.css.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
tailwind.config = {
    future: { hoverOnlyWhenSupported: true },
    theme: {
        extend: {
            fontFamily: { sans: ['var(--font)', 'system-ui', 'sans-serif'], display: ['var(--font)', 'system-ui', 'sans-serif'] },
            // Named by role, not by shade, so the markup reads the same in any theme.
            colors: {
                paper: v('paper'),
                surface: v('surface'),
                tint: { DEFAULT: v('tint'), 2: v('tint-2') },
                ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3') },
                accent: { DEFAULT: v('accent'), deep: v('accent-deep') },
                'on-accent': v('on-accent'),
                gold: v('gold'),
            },
        },
    },
};
