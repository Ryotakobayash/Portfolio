// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ryota5884.com',
  output: 'server',
  integrations: [react()],
  adapter: vercel(),
});