// Branded print art for kiranic.com — a Swiss/International-Typographic poster
// plus a square sticker. satori (lays out flexbox + renders text as vector
// paths from IBM Plex Mono) → @resvg/resvg-js → high-res PNG.
//
//   npm run art   →   public/kiranic-poster.png (A4, 300 DPI)  +  public/kiranic-sticker.png
//   (written to public/ so they're downloadable straight from the site)
//
// Design philosophy: Swiss grid — mono type, strong hierarchy, restrained
// teal/ochre palette on near-black, generous whitespace, one geometric motif
// (a row of "slot reels", nodding to the Slop Machine). No stock, no clip-art.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const fontDir = resolve(root, 'node_modules/@ibm/plex-mono/fonts/complete/woff');
const outDir = resolve(root, 'public');
mkdirSync(outDir, { recursive: true });

const wf = (file) => readFileSync(resolve(fontDir, file));
const fonts = [
    { name: 'Plex', weight: 200, style: 'normal', data: wf('IBMPlexMono-ExtraLight.woff') },
    { name: 'Plex', weight: 300, style: 'normal', data: wf('IBMPlexMono-Light.woff') },
    { name: 'Plex', weight: 400, style: 'normal', data: wf('IBMPlexMono-Regular.woff') },
    { name: 'Plex', weight: 500, style: 'normal', data: wf('IBMPlexMono-Medium.woff') },
    { name: 'Plex', weight: 600, style: 'normal', data: wf('IBMPlexMono-SemiBold.woff') },
    { name: 'Plex', weight: 700, style: 'normal', data: wf('IBMPlexMono-Bold.woff') },
];

// Brand palette (tailwind.config.mjs).
const C = { bg: '#292330', teal: '#297081', tealLight: '#88BDC1', ochre: '#E29D35', surface: '#F5F5F4', mute: '#7d7889' };

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, ...(children !== undefined ? { children } : {}) } });
const txt = (str, style) => h('div', style, str);

// A row of three "slot reels" — the recurring geometric motif.
const reels = (size, gap) =>
    h('div', { flexDirection: 'row', gap }, [
        h('div', { width: size, height: size, backgroundColor: C.teal }),
        h('div', { width: size, height: size, backgroundColor: C.ochre }),
        h('div', { width: size, height: size, backgroundColor: C.tealLight }),
    ]);

const accentBar = (height) =>
    h('div', { width: '100%', height, flexDirection: 'row' }, [
        h('div', { flex: 2, backgroundColor: C.teal }),
        h('div', { flex: 1, backgroundColor: C.ochre }),
    ]);

// ── Poster: A4 portrait @ 300 DPI ────────────────────────────────────
function poster() {
    const specRow = (label, value) =>
        h('div', {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingTop: 26, paddingBottom: 26, borderBottom: `2px solid #3c3543`,
        }, [
            txt(label, { color: C.tealLight, fontSize: 42, fontWeight: 500, letterSpacing: 3 }),
            txt(value, { color: C.surface, fontSize: 50, fontWeight: 700 }),
        ]);

    return h('div', { width: 2480, height: 3508, flexDirection: 'column', backgroundColor: C.bg, fontFamily: 'Plex' }, [
        accentBar(20),
        h('div', { flexDirection: 'column', flex: 1, padding: 200, justifyContent: 'space-between' }, [
            // Header
            h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
                h('div', { flexDirection: 'row', alignItems: 'center', gap: 34 }, [
                    reels(46, 14),
                    txt('KIRANIC.COM', { color: C.tealLight, fontSize: 46, fontWeight: 600, letterSpacing: 10 }),
                ]),
                txt('PERSONAL SITE · A SATIRE', { color: C.mute, fontSize: 38, fontWeight: 400, letterSpacing: 6 }),
            ]),

            // Headline
            h('div', { flexDirection: 'column' }, [
                txt('FULL DISCLOSURE №01', { color: C.ochre, fontSize: 48, fontWeight: 500, letterSpacing: 12, marginBottom: 40 }),
                txt('99%', { color: C.ochre, fontSize: 600, fontWeight: 700, lineHeight: 0.82 }),
                txt('WRITTEN BY', { color: C.surface, fontSize: 224, fontWeight: 700, lineHeight: 0.98 }),
                h('div', { flexDirection: 'row' }, [
                    txt('AN AI', { color: C.surface, fontSize: 224, fontWeight: 700, lineHeight: 0.98 }),
                    txt('.', { color: C.ochre, fontSize: 224, fontWeight: 700, lineHeight: 0.98 }),
                ]),
                txt('The human just hit Enter, drank coffee, and occasionally fixed a z-index issue he couldn’t see.',
                    { color: C.mute, fontSize: 58, fontWeight: 300, lineHeight: 1.4, marginTop: 56, maxWidth: 1700 }),
            ]),

            // Spec sheet
            h('div', { flexDirection: 'column' }, [
                specRow('AI CONTRIBUTION', '99.9%'),
                specRow('HUMAN EFFORT', 'MINIMAL'),
                specRow('TOKENS BURNED', '∞'),
                specRow('GPUs MELTED', '0'),
                specRow('REGRET', 'NONE'),
            ]),

            // Footer
            h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, [
                h('div', { flexDirection: 'row', alignItems: 'center', gap: 30 }, [
                    h('div', { width: 34, height: 34, borderRadius: 999, backgroundColor: C.ochre }),
                    txt('kiranic.com', { color: C.surface, fontSize: 132, fontWeight: 700 }),
                ]),
                txt('procedurally over-engineered,\nlovingly un-maintained.',
                    { color: C.mute, fontSize: 40, fontWeight: 400, lineHeight: 1.4, textAlign: 'right' }),
            ]),
        ]),
    ]);
}

// ── Sticker: 1080 × 1080 ─────────────────────────────────────────────
function sticker() {
    return h('div', { width: 1080, height: 1080, flexDirection: 'column', backgroundColor: C.bg, fontFamily: 'Plex' }, [
        accentBar(14),
        h('div', { flexDirection: 'column', flex: 1, padding: 90, justifyContent: 'space-between' }, [
            h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
                reels(40, 12),
                txt('№01', { color: C.mute, fontSize: 34, fontWeight: 500, letterSpacing: 6 }),
            ]),
            h('div', { flexDirection: 'column' }, [
                txt('kiranic', { color: C.surface, fontSize: 200, fontWeight: 700, lineHeight: 0.9 }),
                h('div', { flexDirection: 'row', alignItems: 'baseline' }, [
                    txt('.com', { color: C.ochre, fontSize: 200, fontWeight: 700, lineHeight: 0.9 }),
                ]),
                txt('99% AI · 1% COFFEE', { color: C.tealLight, fontSize: 46, fontWeight: 500, letterSpacing: 8, marginTop: 36 }),
            ]),
            h('div', { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [
                txt('press ` for a shell', { color: C.mute, fontSize: 32, fontWeight: 400 }),
                txt('EST. MMXXVI', { color: C.mute, fontSize: 32, fontWeight: 400, letterSpacing: 4 }),
            ]),
        ]),
    ]);
}

async function render(tree, w, file) {
    const svg = await satori(tree, { width: w, height: tree.props.style.height, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
    const out = resolve(outDir, file);
    writeFileSync(out, png);
    console.log(`✓ ${file}  ${w}×${tree.props.style.height}  (${(png.length / 1024).toFixed(0)} KB)`);
}

await render(poster(), 2480, 'kiranic-poster.png');
await render(sticker(), 1080, 'kiranic-sticker.png');
