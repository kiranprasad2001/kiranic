/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
                mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                brand: {
                    bg: '#292330',
                    teal: '#297081',
                    'teal-light': '#88BDC1',
                    ochre: '#E29D35',
                    surface: '#F5F5F4',
                }
            }
        },
    },
    plugins: [],
}
