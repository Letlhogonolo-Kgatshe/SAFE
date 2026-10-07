// Shared Tailwind (CDN) theme for every SAFE page.
tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Poppins', 'Inter', 'sans-serif'] },
            colors: {
                gold: '#FFD700',
                'dark-gold': '#E6B800',
                primary: '#000',
                card: '#141414',
                ink: { 900: '#0a0a0a', 800: '#111111', 700: '#1c1c1c', 600: '#262626' },
            },
        },
    },
};
