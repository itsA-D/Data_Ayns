/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                'bg-main': '#060912',
                'bg-card': 'rgba(16, 20, 35, 0.7)',
                'bg-sidebar': '#0a0e1a',
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
                'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
            },
        },
    },
    plugins: [],
}
