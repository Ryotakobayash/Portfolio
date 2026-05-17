// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ryota5884.com',
  output: 'server',
  integrations: [
    react(),
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      styleOverrides: {
        borderRadius: '0',
        codeFontFamily: 'var(--font-mono)',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    mdx(),
    sitemap(),
  ],
  adapter: vercel(),
});