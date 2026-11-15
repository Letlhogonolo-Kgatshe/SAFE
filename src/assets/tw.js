// Shared Tailwind (CDN) theme for every SAFE page.
tailwind.config = {
    future: { hoverOnlyWhenSupported: true },
    theme: {
        extend: {
            fontFamily: { sans: ['"Inter Tight"', 'system-ui', 'sans-serif'], display: ['"Inter Tight"', 'system-ui', 'sans-serif'] },
            // Named by role, not by shade, so the markup reads the same in any theme.
            colors: {
                paper: '#ffffff',
                surface: '#fafaf7',
                tint: { DEFAULT: '#f4f2ec', 2: '#e9e6dc' },
                ink: { DEFAULT: '#111111', 2: '#3f3d38', 3: '#5f5a50' },
                accent: { DEFAULT: '#8a6400', deep: '#6b4d00' },
                'on-accent': '#ffffff',
                gold: '#e0a800',
            },
        },
    },
};
