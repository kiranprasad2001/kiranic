import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kiranic.pages.dev',
  integrations: [tailwind(), react(), sitemap()],
  output: 'static',
  adapter: cloudflare()
});