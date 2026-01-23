/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui'],
            },
            colors: {
                // Branding: Slate/Dark Blues (Trust & Tech)
                // Using standard Tailwind slate colors which are perfect for this
            }
        },
    },
    plugins: [],
}
