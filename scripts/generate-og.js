// Generates branded Open Graph cards (1200×630 PNG) into /public.
//
//   satori (JSX-free hyperscript) → SVG with text as vector paths
//   → @resvg/resvg-js → PNG (no font needed at raster time).
//
// Run with: npm run og
// Fonts come from the @ibm/plex-mono package (WOFF, which satori accepts).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const fontDir = resolve(root, 'node_modules/@ibm/plex-mono/fonts/complete/woff');

const fonts = [
    { name: 'IBM Plex Mono', weight: 400, style: 'normal', data: readFileSync(resolve(fontDir, 'IBMPlexMono-Regular.woff')) },
    { name: 'IBM Plex Mono', weight: 700, style: 'normal', data: readFileSync(resolve(fontDir, 'IBMPlexMono-Bold.woff')) },
];

// Brand palette (mirrors tailwind.config.mjs).
const C = { bg: '#292330', teal: '#297081', tealLight: '#88BDC1', ochre: '#E29D35', surface: '#F5F5F4', mute: '#9aa0a6' };

// Minimal hyperscript so we don't need JSX/a build step.
const h = (type, style, children) => ({ type, props: { style, ...(children !== undefined ? { children } : {}) } });

// One OG card layout, parameterised by content + accent colour.
function card({ eyebrow, title, subtitle, url, accent }) {
    return h('div', {
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', backgroundColor: C.bg, padding: '64px 72px',
        fontFamily: 'IBM Plex Mono', position: 'relative',
    }, [
        // top accent bar
        h('div', { position: 'absolute', top: 0, left: 0, right: 0, height: '10px', display: 'flex' }, [
            h('div', { flex: 2, backgroundColor: C.teal }),
            h('div', { flex: 1, backgroundColor: C.ochre }),
        ]),
        // header row
        h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '24px', color: C.tealLight }, [
            h('div', { fontWeight: 700 }, 'kiran prasad'),
            h('div', { color: C.mute, fontSize: '20px' }, 'kiranic.com'),
        ]),
        // middle: eyebrow + title + subtitle
        h('div', { display: 'flex', flexDirection: 'column' }, [
            h('div', { color: C.ochre, fontSize: '22px', letterSpacing: '4px', marginBottom: '20px' }, eyebrow),
            h('div', { color: C.surface, fontSize: '64px', fontWeight: 700, lineHeight: 1.1 }, title),
            h('div', { color: C.mute, fontSize: '28px', marginTop: '24px', lineHeight: 1.4 }, subtitle),
        ]),
        // footer: accent dot + url
        h('div', { display: 'flex', alignItems: 'center', fontSize: '22px', color: C.mute }, [
            h('div', { width: '14px', height: '14px', borderRadius: '9999px', backgroundColor: accent, marginRight: '14px', display: 'flex' }),
            h('div', {}, url),
        ]),
    ]);
}

const cards = [
    {
        file: 'og-default.png',
        eyebrow: 'ECM / CCM / CXM / CLOUD',
        title: 'Architecting the future of digital experience.',
        subtitle: '13+ years modernizing legacy systems for banking & insurance.',
        url: 'kiranic.com',
        accent: C.teal,
    },
    {
        file: 'og-slop-machine.png',
        eyebrow: 'BREAKING · VENTUREBEAT-ADJACENT',
        title: 'The Slop Machine',
        subtitle: 'Infinite AI headlines, hallucinated in your browser. $0.00. Zero tokens.',
        url: 'kiranic.com/slop-machine',
        accent: C.ochre,
    },
];

for (const c of cards) {
    const svg = await satori(card(c), { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    const out = resolve(root, 'public', c.file);
    writeFileSync(out, png);
    console.log(`✓ ${c.file} (${(png.length / 1024).toFixed(0)} KB)`);
}
